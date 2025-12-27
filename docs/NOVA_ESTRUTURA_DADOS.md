# Nova Estrutura de Dados (LTV & Controle Híbrido)

Esta modelagem complementa a base existente (Alunos, Trilhas) adicionando camadas de **Produto**, **Financeiro** e **Controle de Automação**.

---

## 1. Configurações de Integração
*Necessário para a "Tela de Login e Configuração"*

```sql
CREATE TABLE configuracoes (
    chave VARCHAR(100) PRIMARY KEY, -- Ex: 'hotmart_access_token', 'meta_whatsapp_id'
    valor TEXT NOT NULL,
    descricao TEXT,
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    ativo BOOLEAN DEFAULT true
);
```

---

## 2. Camada de Conteúdo e Progresso (Granularidade Máxima)
*Para suportar a API Hotmart que entrega dados por página/aula (`GET /club/users/{id}/lessons`).*

```sql
CREATE TABLE aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES produtos(id),
    
    hotmart_page_id VARCHAR(50),      -- Ex: "RMe1YEyeYx"
    hotmart_page_name VARCHAR(255),   -- Ex: "Page 1 Module 1"
    hotmart_module_name VARCHAR(255), -- Ex: "Module 1"
    
    is_extra BOOLEAN DEFAULT false,
    ordem INTEGER, -- Para saber a sequência
    
    -- Dados de Entrega (Dripping) para automação "Sua aula liberou!"
    dias_liberacao INTEGER, -- Se for BY_DAYS (libera X dias após compra)
    data_liberacao_fixa TIMESTAMPTZ, -- Se for BY_DATE
    
    UNIQUE(produto_id, hotmart_page_id)
);

CREATE TABLE progresso_detalhado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES alunos(id),
    aula_id UUID REFERENCES aulas(id),
    
    concluido BOOLEAN DEFAULT false,
    data_conclusao TIMESTAMPTZ, -- Importante para saber se "estagnou"
    
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(aluno_id, aula_id)
);
-- A tabela antiga 'progresso_alunos' (percentual macro) pode ser mantida como view consolidada ou cache.
```

---

## 3. Camada de Produto e Oferta
*Necessário para "Puxar Produtos" e gerenciar múltiplos infoprodutos.*

```sql
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    hotmart_product_id INTEGER UNIQUE, -- ID numérico da Hotmart (ex: 3526906)
    hotmart_ucode VARCHAR(50),         -- UUID do produto na Hotmart
    capa_url TEXT,
    ativo_monitoramento BOOLEAN DEFAULT false, -- Se nosso robô deve cuidar deste produto
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ofertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES produtos(id),
    hotmart_offer_code VARCHAR(50),    -- Ex: 'n82b9jqz'
    nome_oferta VARCHAR(255),          -- Ex: 'Plano Anual - Black Friday'
    preco DECIMAL(10, 2),
    moeda VARCHAR(3) DEFAULT 'BRL',
    ativo BOOLEAN DEFAULT true
);
```

---

## 3. Camada Financeira e Acesso
*Necessário para "Dossiê do Aluno", LTV e controle de acesso.*

```sql
CREATE TABLE transacoes (
    id VARCHAR(50) PRIMARY KEY, -- Transaction Code da Hotmart (ex: HP17715690036014)
    aluno_id UUID REFERENCES alunos(id),
    produto_id UUID REFERENCES produtos(id),
    oferta_id UUID REFERENCES ofertas(id),
    
    status VARCHAR(50) NOT NULL, -- APPROVED, REFUNDED, CHARGEBACK, DELAYED
    valor_pago DECIMAL(10, 2),
    moeda VARCHAR(3),
    meio_pagamento VARCHAR(50),  -- CREDIT_CARD, PIX, BILLET
    
    data_compra TIMESTAMPTZ,
    data_aprovacao TIMESTAMPTZ,
    data_reembolso TIMESTAMPTZ,
    data_garantia_fim TIMESTAMPTZ, -- (Novo) Para saber quando vence a garantia (Risco de Reembolso)
    
    -- Dados de Pagamento Recuperáveis (Para automação de boleto/pix)
    link_boleto TEXT,
    codigo_pix TEXT,
    parcelas INTEGER,
    
    origem_src VARCHAR(100),     -- UTM Source / SRC
    origem_sck VARCHAR(100),     -- Source Check (Rastreamento Hotmart)
    tipo_comissao VARCHAR(20),   -- PRODUCER, AFFILIATE (Para saber se veio de afiliado)
    
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES alunos(id),
    produto_id UUID REFERENCES produtos(id),
    transacao_origem_id VARCHAR(50) REFERENCES transacoes(id),
    
    hotmart_subscription_id INTEGER, -- ID da assinatura se houver
    status_acesso VARCHAR(20),       -- ATIVO, CANCELADO, BLOQUEADO, EXPIRADO
    
    data_inicio TIMESTAMPTZ DEFAULT NOW(),
    data_fim TIMESTAMPTZ,            -- NULL = vitalício ou recorrente ativo
    data_renovacao TIMESTAMPTZ,      -- Próxima cobrança
    
    origem_primeiro_acesso VARCHAR(50), -- 'email_hotmart' ou 'zap_terceiriza' (Para provar valor)
    
    UNIQUE(aluno_id, produto_id)
);
```

---



## 5. Camada de Automação Híbrida (Inteligência + Controle)
*Necessário para "Gerenciar Campanhas" e evitar disparos loucos.*

```sql
CREATE TABLE regras_automacao (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,        -- Ex: "Resgate Módulo 1", "Boas Vindas"
    descricao TEXT,
    
    gatilho VARCHAR(50) NOT NULL,      -- 'compra_aprovada', 'progresso_estagnado', 'boleto_impresso'
    condicao_json JSONB,               -- Ex: {"dias_sem_acesso": 7, "modulo_id": 1}
    
    template_sugerido_id INTEGER REFERENCES templates(id),
    
    modo_execucao VARCHAR(20) DEFAULT 'SUGERIR_APENAS', 
    -- 'SUGERIR_APENAS' (Gera fila para humano aprovar)
    -- 'AUTOMATICO_TOTAL' (Dispara sem perguntar - SÓ PARA BOAS VINDAS)
    
    ativo BOOLEAN DEFAULT true
);

CREATE TABLE filas_disparo (
    id BIGSERIAL PRIMARY KEY,
    regra_id INTEGER REFERENCES regras_automacao(id),
    aluno_id UUID REFERENCES alunos(id),
    
    template_usado_id INTEGER REFERENCES templates(id),
    variaveis_json JSONB, -- O que vai preencher o template (Nome, Link)
    
    status VARCHAR(20) DEFAULT 'pendente', 
    -- 'pendente' (Aguardando Humano), 'aprovado', 'rejeitado', 'enviado', 'erro'
    
    data_sugestao TIMESTAMPTZ DEFAULT NOW(),
    data_processamento TIMESTAMPTZ,
    
    motivo_rejeicao TEXT -- Se o CS rejeitar, explica porquê
);
```

---

## ✅ Checklist: Isso resolve tudo?

1.  **Dossiê do Aluno:** `alunos` + `matriculas` + `transacoes` cobre acesso e histórico financeiro.
2.  **Múltiplos Produtos:** `produtos` e `ofertas` resolvem.
3.  **Prova de Valor:** `matriculas.origem_primeiro_acesso` e `recuperacao_vendas.transacao_convertida_id` provam ROI exato.
4.  **Segurança de Disparo:** `regras_automacao` define o modo e `filas_disparo` segura a onda para o humano aprovar.
5.  **Integrações:** `configuracoes` guarda as chaves.

**Veredito:** A estrutura está sólida e alinhada com as telas desenhadas.

---

## 6. Atualizações em Tabelas Existentes (Conexões)
*Como ligamos o que JÁ EXISTE com o NOVO.*

### A. Templates (Sincronização com Meta)
A tabela `templates` deve funcionar como um **ESPELHO ENRIQUECIDO** da API da Meta.
1.  **Sincronização:** Um Worker busca periodicamente na Meta (`GET /message_templates`).
2.  **Enriquecimento (Nosso Lado):** No banco, associamos esse template a um `produto_id` e `funil`.
*Não criamos templates no banco manualmente, apenas "puxamos" e "configuramos".*

```sql
ALTER TABLE templates 
ADD COLUMN produto_id UUID REFERENCES produtos(id);

ALTER TABLE templates 
ADD COLUMN meta_status VARCHAR(50); -- APPROVED, REJECTED, PENDING (Vindo da API)

ALTER TABLE templates 
ADD COLUMN meta_last_sync TIMESTAMPTZ; -- Quando atualizamos por último
```

### B. Trilhas (Hierarquia)
As trilhas (módulos) hoje estão "soltas". Elas precisam pertencer a um produto.

```sql
ALTER TABLE trilhas 
ADD COLUMN produto_id UUID REFERENCES produtos(id);
```

### C. Alunos (Dados Financeiros)
Para evitar joins pesados toda hora, trazemos o LTV para o cadastro.

```sql
ALTER TABLE alunos 
ADD COLUMN ltv_total DECIMAL(10, 2) DEFAULT 0; -- Soma de todas as transações aprovadas
```

---

## 🔁 Fluxo de Vida do Dado

1.  **Compra Aprovada:** 
    *   Cria `transacao`.
    *   Cria `matricula` (Status: ATIVO).
    *   Atualiza `ltv_total` do aluno.
    *   Gatilho Automático -> Busca `regra_boas_vindas` do `produto_id` -> Envia Template.

2.  **Progresso (Consumo):**
    *   Webhook Club -> Atualiza `progresso_alunos` (tabela já existente).
    *   Cronjob -> Verifica regra "Estagnação" -> Cria sugestão em `filas_disparo`.

