# Especificação Mestre do Banco de Dados (Terceiriza CS)

Este documento define a **Verdade Única** sobre os dados do sistema.
**Objetivo:** Suportar uma operação de Customer Success de alta performance, focada em LTV, Recuperação de Acesso e Hiper-personalização.

---

## 1. Núcleo de Configuração (System Core)
*Onde guardamos os segredos e configurações globais.*

| Tabela | Função | Justificativa |
| :--- | :--- | :--- |
| **`configuracoes`** | Armazenar credenciais de API (Hotmart, Meta, Chatwoot) e chaves do sistema. | Evita hardcoding no código e permite rotação fácil de chaves. |

```sql
CREATE TABLE configuracoes (
    chave VARCHAR(100) PRIMARY KEY, -- Ex: 'hotmart_access_token'
    valor TEXT NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Núcleo de Produto (Catalog)
*O que estamos vendendo e entregando?*

| Tabela | Função | Justificativa |
| :--- | :--- | :--- |
| **`produtos`** | Catálogo dos cursos/mentorias (Espelho Hotmart). | Um aluno pode comprar múltiplos produtos. Precisamos saber quais são. |
| **`ofertas`** | Variações de preço/plano (Ex: Anual vs Mensal). | Importante para calcular LTV e saber se é High Ticket ou Low Ticket. |
| **`modulos`** | Estrutura de módulos do curso. | Para monitorar onde o aluno trava. |
| **`aulas`** | Granularidade máxima (Páginas/Aulas). | A API Hotmart entrega progresso por aula. Permite automação "Sua aula liberou". |

```sql
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    hotmart_product_id INTEGER UNIQUE, -- ID Unico Hotmart (ex: 3526906)
    hotmart_subdomain VARCHAR(100), -- (Novo) Subdominio do Club para puxar aulas
    capa_url TEXT,
    ativo_monitoramento BOOLEAN DEFAULT false -- Botão ON/OFF do CS
);

CREATE TABLE ofertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES produtos(id),
    hotmart_offer_code VARCHAR(50), -- Código da Oferta (ex: n82b9jqz)
    nome VARCHAR(255),
    preco DECIMAL(10, 2),
    moeda VARCHAR(3) DEFAULT 'BRL'
);

CREATE TABLE modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES produtos(id),
    hotmart_module_id VARCHAR(50), -- ID Alfanumerico
    nome VARCHAR(255),
    ordem INTEGER,
    UNIQUE(produto_id, hotmart_module_id)
);

CREATE TABLE aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id UUID REFERENCES modulos(id),
    hotmart_page_hash VARCHAR(50), -- Hash da pagina na Hotmart
    nome VARCHAR(255),
    ordem INTEGER,
    dias_liberacao INTEGER, -- Dripping (Libera em X dias)
    UNIQUE(modulo_id, hotmart_page_hash)
);
```

---

## 3. Núcleo do Cliente (CRM)
*Quem é o aluno e qual o valor dele?*

| Tabela | Função | Justificativa |
| :--- | :--- | :--- |
| **`alunos`** | Cadastro único da pessoa (CPF é a chave mestra). | Centraliza dados pessoais independente de quantos produtos comprou. |
| **`matriculas`** | Vínculo Aluno <-> Produto. | Gerencia acesso, status (Ativo/Cancelado) e datas de expiração. |
| **`transacoes`** | Histórico financeiro (O dinheiro). | Guarda links de boleto, status de pagamento e permite cálculo de LTV. |

```sql
CREATE TABLE alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    celular VARCHAR(50), -- Formatado para WhatsApp (55...)
    cpf VARCHAR(20),     -- Chave de unicidade opcional
    foto_url TEXT,
    ltv_total DECIMAL(10, 2) DEFAULT 0, -- Campo calculado
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transacoes (
    id VARCHAR(50) PRIMARY KEY, -- Transaction Code (HP...)
    aluno_id UUID REFERENCES alunos(id),
    produto_id UUID REFERENCES produtos(id),
    oferta_id UUID REFERENCES ofertas(id),
    status VARCHAR(50), -- APPROVED, REFUNDED, WAITING_PAYMENT
    valor_pago DECIMAL(10, 2),
    data_compra TIMESTAMPTZ,
    data_garantia_fim TIMESTAMPTZ, -- Para automação de "Risco de Reembolso"
    link_boleto TEXT, -- Para recuperação
    codigo_pix TEXT,  -- Para recuperação
    origem_src VARCHAR(100) -- Rastreamento
);

CREATE TABLE matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES alunos(id),
    produto_id UUID REFERENCES produtos(id),
    transacao_origem_id VARCHAR(50) REFERENCES transacoes(id),
    status_acesso VARCHAR(20), -- ATIVO, BLOQUEADO, EXPIRADO
    data_inicio TIMESTAMPTZ,
    data_renovacao TIMESTAMPTZ, -- Para cobrar renovação
    origem_primeiro_acesso VARCHAR(50) -- KPI: 'zap_terceiriza' ou 'email_hotmart'
);
```

---

## 4. Núcleo de Inteligência (Progresso & Tags)
*O que o aluno está fazendo?*

| Tabela | Função | Justificativa |
| :--- | :--- | :--- |
| **`progresso_aulas`** | Checkpoint de cada aula concluída. | Permite saber exatamente onde o aluno parou. |
| **`tags_aluno`** | Etiquetas de comportamento (Ex: "Super Fã", "Reclamão"). | Sincronizado com Chatwoot para dar contexto ao atendente. |

```sql
CREATE TABLE progresso_aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricula_id UUID REFERENCES matriculas(id),
    aula_id UUID REFERENCES aulas(id),
    data_conclusao TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(matricula_id, aula_id)
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) UNIQUE, -- Ex: "vip", "churn_risk"
    cor_hex VARCHAR(10)
);

CREATE TABLE alunos_tags (
    aluno_id UUID REFERENCES alunos(id),
    tag_id INTEGER REFERENCES tags(id),
    PRIMARY KEY (aluno_id, tag_id)
);
```

---

## 5. Núcleo de Comunicação & Automação (Engine)
*Como falamos com o aluno de forma segura?*

| Tabela | Função | Justificativa |
| :--- | :--- | :--- |
| **`templates`** | Espelho dos templates do WhatsApp Business. | Precisam estar vinculados a produto para não mandar msg errada. |
| **`regras_automacao`** | O "Cérebro". Define SE acontecer X, FAÇA Y. | Permite criar funis dinâmicos sem programar. |
| **`filas_disparo`** | O "Freio". Fila de aprovação humana. | Evita disparos em massa acidentais. O CS aprova aqui. |
| **`logs_disparo`** | Histórico do que foi enviado. | "Cala a boca" jurídico e de auditoria. |

```sql
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    nome_meta VARCHAR(255), -- Nome exato na Meta
    produto_id UUID REFERENCES produtos(id), -- Template exclusivo de um produto
    conteudo_texto TEXT,
    namespace VARCHAR(100),
    status_meta VARCHAR(50) -- APPROVED, REJECTED
);

CREATE TABLE regras_automacao (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    gatilho VARCHAR(50), -- 'compra_aprovada', 'progresso_estagnado', 'aniversario_compra'
    condicao_json JSONB, -- { "dias_sem_acesso": 7, "modulo_id": "uuid..." }
    template_id INTEGER REFERENCES templates(id),
    modo_execucao VARCHAR(20) DEFAULT 'SUGERIR', -- 'SUGERIR' (Fila) ou 'AUTOMATICO' (Direto)
    ativo BOOLEAN DEFAULT true
);

CREATE TABLE filas_disparo (
    id BIGSERIAL PRIMARY KEY,
    regra_id INTEGER REFERENCES regras_automacao(id),
    aluno_id UUID REFERENCES alunos(id),
    template_id INTEGER REFERENCES templates(id),
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, aprovado, rejeitado, erro
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    motivo_rejeicao TEXT
);

CREATE TABLE logs_disparo (
    id BIGSERIAL PRIMARY KEY,
    aluno_id UUID REFERENCES alunos(id),
    template_id INTEGER REFERENCES templates(id),
    mensagem_id_whatsapp VARCHAR(100), -- WAMID
    status_entrega VARCHAR(50), -- sent, delivered, read (Via Webhook Meta)
    data_envio TIMESTAMPTZ DEFAULT NOW()
);
```
