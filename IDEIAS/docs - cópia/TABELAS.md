# TABELAS - Terceiriza CS v2.8

**Versão:** 2.8 ✅  
**Data de Criação:** 16 de Outubro de 2025  
**Última Atualização:** 03 de Novembro de 2025 🎯 (Campo Ativo + Auto-preenchimento Apelido)  
**Total de Tabelas:** 13 (8 core + 2 Chatwoot + 1 snapshots + 1 tags + 1 logs)  
**Total de Triggers:** 2 (trigger_criar_templates_padrao + trigger_atualizar_aluno_automatico)  
**Arquitetura:** Relacional com integridade referencial completa + Sistema de Memória Hierárquica + Tags Soberanas + Sincronização Externa + Auditoria de Webhooks + **Triggers Automáticos** + **Validação Flexível de Celular**  
**Status:** ✅ v2.8 em Produção (100% validado contra banco PostgreSQL Supabase)

---

## 📜 HISTÓRICO DE VERSÕES

| Versão | Data | Mudanças Principais | Status |
|--------|------|---------------------|--------|
| **2.8** | **03/11/2025** | **✅ CAMPO ATIVO + AUTO-APELIDO:** Adicionada coluna `ativo BOOLEAN` na tabela `alunos` para controlar elegibilidade em campanhas. Removido CHECK constraint rígido `check_celular_format` (agora permite salvar celulares inválidos mas marca ativo=false). Implementado trigger `trigger_atualizar_aluno_automatico` que: (1) auto-preenche `apelido` com primeiro nome extraído de `nome_completo`, (2) valida formato celular (^55[0-9]{11}$) e define ativo=true/false. Função `buscar_dossie_cs()` v2.2 retorna campo `ativo`. Workflow Run_Campaign Node 3.1 filtra apenas alunos ativos. Benefícios: validação flexível (não perde dados), menos trabalho manual, campanhas apenas para números válidos. | ✅ Produção |
| **2.7** | **03/11/2025** | **🤖 TRIGGER AUTO-CRIAÇÃO DE TEMPLATES:** Implementado trigger PostgreSQL `trigger_criar_templates_padrao` que automaticamente cria 2 templates (Engajado + Desengajado) sempre que uma nova trilha é inserida. Removido UNIQUE constraint de `templates.template_id_whatsapp` para permitir múltiplos templates com ID `'base'`. Função PL/pgSQL `criar_templates_padrao_trilha()` gera templates inativos com conteúdo padrão aprovado na Meta. Validado: 11 trilhas → 22 templates criados automaticamente. Benefícios: zero trabalho manual, consistência garantida, escalabilidade. | ✅ Produção |
| **2.6** | **03/11/2025** | **📚 DADOS DE SEED REAIS:** Atualizado seed de trilhas com dados reais do Bruno Lucarelli. 11 trilhas (Boas Vindas + Missões 01-10) com `id_externo` mapeado para produtos Cademi. Documentação atualizada: comentários, scripts de validação (3→11 trilhas), e script de seeding completo. Produto pronto para sincronização automática com Cademi via workflow Sync_External_Data v3.0. | ✅ Produção |
| **2.5** | **03/11/2025** | **🔄 MIGRAÇÃO UUID COMPLETA:** Migrado `trilhas.id` de INTEGER para UUID para consistência arquitetural total. Todas as PKs agora são UUID (alunos, trilhas, conversas_chatwoot). Tabelas atualizadas: `trilhas` (PK migrada), `progresso_alunos` (FK migrada), `campanhas` (FK trilha_foco_id), `snapshots_alunos_campanhas` (FK trilha_foco_id), `templates` (FK trilha_id). 4 Foreign Keys recriadas com CASCADE/SET NULL. Benefícios: consistência total, escalabilidade, segurança (IDs não previsíveis). | ✅ Produção |
| **2.4** | **02/11/2025** | **📊 AUDITORIA DE WEBHOOKS:** Adicionada tabela `webhook_logs` para rastreabilidade completa de webhooks do Cademi. Armazena todos os eventos recebidos (sucesso, erro 400, erro 404) com payload completo em JSONB para debug. Índices criados: idx_webhook_logs_status, idx_webhook_logs_data. Permite análise de taxa de sucesso e investigação de falhas. | ✅ Produção |
| **2.3** | **02/11/2025** | **🔄 SINCRONIZAÇÃO EXTERNA:** Adicionada coluna `id_externo` (INTEGER UNIQUE) em tabelas `alunos` e `trilhas` para integração com sistema externo Cademi via workflow [CS] Sync_External_Data. **Tabela trilhas:** removido UNIQUE constraint de `ordem` (permite duplicatas). **Estratégia:** Alunos e trilhas cadastrados manualmente com `id_externo` preenchido. Webhook sincroniza apenas progresso (read-only para alunos/trilhas). Índices criados: idx_alunos_id_externo, idx_trilhas_id_externo. | ✅ Produção |
| **2.2.1** | **02/11/2025** | **✅ VALIDAÇÃO COMPLETA:** Executados 5 scripts SQL progressivos contra banco de produção. Documentação atualizada com nomenclaturas reais de funis (Nunca Acessou, Primeiro Acesso, Engajado, Desengajado, Recompra), trilhas (Semanas 01-03), e seed data completo (20 tags, 9 templates). Índices não-implementados documentados como desnecessários (tabelas pequenas). | ✅ Doc Validado |
| **2.2** | **28/10/2025** | **🏷️ SISTEMA DE TAGS:** Adicionar tabela `tags_disponiveis` (20 tags: 10 objetivos + 10 conquistas). Adicionar colunas `tags_objetivos TEXT[]` e `tags_conquistas TEXT[]` na tabela `alunos` com índices GIN para busca eficiente. **Tags Soberanas:** Supabase é fonte única de verdade, Chatwoot apenas espelha labels. | ✅ Produção |
| **2.1** | **18/10/2025** | **🚀 OTIMIZAÇÃO:** Função `buscar_dossie_cs()` v2.1 agora usa snapshot mais recente ao invés de recalcular funil (10x mais rápida: ~10ms vs ~100ms). **Single Source of Truth:** Lógica de classificação centralizada no Workflow Run_Campaign. | ✅ Produção |
| **2.1** | **23/10/2025** | **📊 SIMPLIFICAÇÃO mensagens_chatwoot:** Removidos campos `remetente_tipo` (substituído por `is_agent` boolean) e `anexos` (conteúdo sempre textualizado). Renomeado `remetente_id` → `agent_id`. Reduzido de 9 para 8 campos. Inputs da Tool reduzidos de 7 para 5 parâmetros. | ✅ Produção |
| **2.0** | **18/10/2025** | **🎉 INTEGRAÇÃO CHATWOOT:** Adicionar `conversas_chatwoot` (Sistema de Memória Hierárquica com 3 níveis), `mensagens_chatwoot` (audit trail completo), e 3 colunas em `logs_envios`. Atualizar função `buscar_dossie_cs()` para incluir memória hierárquica. **CORREÇÃO:** conversas_chatwoot usa `aluno_id UUID` (FK para alunos.id) em vez de `celular VARCHAR`. | ✅ Produção |
| 1.5 | 17/10/2025 | Correção threshold Recompra (>60%), validação completa | ✅ Produção |
| 1.4 | 16/10/2025 | Adicionar índices de performance | ✅ Produção |
| 1.3 | 15/10/2025 | Adicionar tabela `snapshots_alunos_campanhas` para BI | ✅ Produção |
| 1.2 | 14/10/2025 | Refinamento de constraints e triggers | ✅ Produção |
| 1.1 | 13/10/2025 | Adicionar tabelas `funis_especificos`, `campanhas` | ✅ Produção |
| 1.0 | 12/10/2025 | Setup inicial: 5 tabelas core | ✅ Produção |

**🔥 BREAKING CHANGE v2.0:** Nova arquitetura de conversas com Chatwoot. Sistema de Memória Hierárquica implementado (inspirado em cognição humana).

---

## 🧠 SISTEMA DE MEMÓRIA HIERÁRQUICA (v2.0)

A v2.0 introduz um sistema revolucionário de **memória hierárquica** inspirado na cognição humana, permitindo que o bot de CS tenha contexto completo sem precisar "buscar" informações:

```
┌─────────────────────────────────────────────────────┐
│ NÍVEL 1: MEMÓRIA DE LONGO PRAZO                    │
│ contexto_historico (conversas antigas)             │
│ "Out/2025: Problema boleto. Set/2025: Dúvidas."   │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ NÍVEL 2: MEMÓRIA DE TRABALHO                       │
│ resumo_evolutivo (conversa atual - msg a msg)     │
│ "Cliente relatou problema X, aguardando Y..."      │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ NÍVEL 3: MEMÓRIA CONSOLIDADA                       │
│ resumo_final (quando conversa resolve)            │
│ "Problema X resolvido. Cliente satisfeito."       │
└─────────────────────────────────────────────────────┘
```

**Benefícios:**
- ✅ Cliente se sente **conhecido** (não tratado como estranho)
- ✅ Bot tem contexto **sempre disponível** (no prompt, zero latência)
- ✅ Experiência indistinguível de **humano super-atendendo**
- ✅ Custo: ~R$ 17/mês para 10.000 mensagens (ridiculamente barato)

---

## 📊 VISÃO GERAL DO SISTEMA

### Como o Sistema Funciona

O sistema classifica alunos em **funis de engajamento** e envia mensagens personalizadas via WhatsApp com base em dois critérios simultâneos:

1. **Funil Global** - Mede a "saúde geral" do aluno no curso completo
2. **Funil da Trilha** - Mede o "ritmo atual" do aluno na etapa/módulo específico

### Fluxo de Dados

```
ALUNO → PROGRESSO → CLASSIFICAÇÃO DUAL → TEMPLATE → ENVIO → CHATWOOT
   ↓         ↓              ↓                ↓          ↓          ↓
alunos  progresso_   funis_globais +   templates  logs_envios  conversas_chatwoot
        alunos       funis_especificos                              ↓
                           ↓                                   mensagens_chatwoot
                    snapshots_alunos_campanhas (BI)
```

### Estrutura das 13 Tabelas

#### 📊 Tabelas de Entidades Principais

1. **`alunos`** - Cadastro de estudantes (com tags)
2. **`trilhas`** - Módulos/Etapas do curso
3. **`templates`** - Mensagens WhatsApp pré-aprovadas
4. **`progresso_alunos`** - Avanço do aluno por trilha

#### 🎯 Tabelas de Classificação (Funis)

5. **`funis_globais`** - 5 tipos de saúde geral
6. **`funis_especificos`** - 2 tipos de ritmo na trilha

#### 🚀 Tabelas Operacionais

7. **`campanhas`** - Registro de cada execução
8. **`logs_envios`** - Auditoria completa (com 3 colunas Chatwoot v2.0)
9. **`snapshots_alunos_campanhas`** - Business Intelligence

#### 💬 Tabelas Chatwoot (v2.0 - NOVAS)

10. **`conversas_chatwoot`** - Sistema de Memória Hierárquica ⭐
11. **`mensagens_chatwoot`** - Audit Trail 1:1 ⭐

#### 🏷️ Tabelas Tags (v2.2 - NOVA)

12. **`tags_disponiveis`** - Catálogo de Tags (objetivos e conquistas) ⭐

#### 🔌 Tabelas de Integração (v2.4 - NOVA)

13. **`webhook_logs`** - Auditoria de Webhooks Cademi (Sync_External_Data) ⭐

---

## 📋 REGRAS DE NEGÓCIO

### Classificação de Funis Globais

| ID | Nome | Condição |
|----|------|----------|
| 1 | Nunca Acessou | 0% progresso geral |
| 2 | Recompra | >60% progresso geral |
| 3 | Engajado (Geral) | 21-60% + ativo (<30 dias sem acessar) |
| 4 | Desengajado (Geral) | 1-60% + inativo (≥30 dias sem acessar) |
| 5 | Primeiro Acesso (Geral) | 1-20% + ativo (<30 dias) |

### Classificação de Funis Específicos (Trilha)

| ID | Nome | Condição |
|----|------|----------|
| 1 | Engajado (Trilha) | >50% na trilha atual |
| 2 | Desengajado (Trilha) | ≤50% na trilha atual |

### Regras de Templates

- ✅ Template **GLOBAL**: Tem `funil_global_id` preenchido, `trilha_id` e `funil_especifico_id` são NULL
- ✅ Template **ESPECÍFICO**: Tem `trilha_id` + `funil_especifico_id` preenchidos, `funil_global_id` é NULL
- ✅ Garantido por CHECK constraint: Um template é global **XOR** específico (nunca ambos)
- ⚠️ **IMPORTANTE (v2.7)**: UNIQUE constraint de `template_id_whatsapp` foi **removido**. Múltiplos templates podem usar mesmo ID WhatsApp (`'base'`). Diferenciação via `trilha_id` + `funil_especifico_id`.

### 🤖 Triggers e Automações (v2.7 + v2.8)

#### Trigger: `trigger_criar_templates_padrao`
- **Tabela:** `trilhas`
- **Evento:** `AFTER INSERT`
- **Função:** `criar_templates_padrao_trilha()`
- **Comportamento:** Sempre que uma nova trilha é inserida, **cria automaticamente 2 templates**:
  1. **Template Engajado**: `funil_especifico_id = 1`, `descricao = 'Mensagem para quem está Engajado na trilha [Nome]'`
  2. **Template Desengajado**: `funil_especifico_id = 2`, `descricao = 'Mensagem para quem está Desengajado na trilha [Nome]'`
- **Especificações dos Templates Criados:**
  - `template_id_whatsapp`: `'base'` (template aprovado na Meta)
  - `conteudo`: `'Oi *{{1}}* ,tudo bem com você???'`
  - `ativo`: `false` (inativo até revisão manual)
  - `trilha_id`: UUID da trilha recém-criada
- **Benefícios:**
  - ✅ Zero trabalho manual para criar templates de novas trilhas
  - ✅ Consistência garantida (impossível esquecer de criar templates)
  - ✅ Escalabilidade (funciona para trilhas via webhook ou inserção manual)
  - ✅ Segurança (templates criados inativos, não envia mensagens acidentais)

#### Código da Função PL/pgSQL:
```sql
CREATE OR REPLACE FUNCTION criar_templates_padrao_trilha()
RETURNS TRIGGER AS $$
BEGIN
  -- Template 1: Engajado
  INSERT INTO public.templates (
    template_id_whatsapp, descricao, conteudo,
    trilha_id, funil_especifico_id, ativo
  ) VALUES (
    'base',
    'Mensagem para quem está Engajado na trilha ' || NEW.nome_trilha,
    'Oi *{{1}}* ,tudo bem com você???',
    NEW.id, 1, false
  );
  
  -- Template 2: Desengajado
  INSERT INTO public.templates (
    template_id_whatsapp, descricao, conteudo,
    trilha_id, funil_especifico_id, ativo
  ) VALUES (
    'base',
    'Mensagem para quem está Desengajado na trilha ' || NEW.nome_trilha,
    'Oi *{{1}}* ,tudo bem com você???',
    NEW.id, 2, false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Trigger: `trigger_atualizar_aluno_automatico` ⭐ **NOVO v2.8**
- **Tabela:** `alunos`
- **Evento:** `BEFORE INSERT OR UPDATE`
- **Função:** `atualizar_aluno_automatico()`
- **Comportamento:** Sempre que um aluno é inserido ou atualizado, **automaticamente**:
  1. **Auto-preenche `apelido`** com primeiro nome extraído de `nome_completo` (se apelido estiver vazio)
  2. **Valida formato do `celular`** (^55[0-9]{11}$) e define campo `ativo`:
     - ✅ Celular válido → `ativo = true`
     - ⚠️ Celular inválido → `ativo = false` (permite salvar)
     - ❌ Sem celular → `ativo = false`
- **Benefícios:**
  - ✅ **Validação flexível**: Não perde dados (salva celulares inválidos)
  - ✅ **Menos trabalho manual**: Apelido preenchido automaticamente
  - ✅ **Controle de qualidade**: Identifica alunos inelegíveis para campanhas
  - ✅ **Zero manutenção**: Lógica centralizada no banco de dados

#### Código da Função PL/pgSQL:
```sql
CREATE OR REPLACE FUNCTION public.atualizar_aluno_automatico()
RETURNS TRIGGER AS $$
DECLARE
  v_primeiro_nome TEXT;
  v_celular_valido BOOLEAN;
BEGIN
  -- =========================================
  -- LÓGICA 1: AUTO-PREENCHER APELIDO
  -- =========================================
  IF NEW.nome_completo IS NOT NULL AND 
     (NEW.apelido IS NULL OR NEW.apelido = '') THEN
    -- Extrair primeiro nome (antes do primeiro espaço)
    v_primeiro_nome := SPLIT_PART(NEW.nome_completo, ' ', 1);
    NEW.apelido := v_primeiro_nome;
  END IF;

  -- =========================================
  -- LÓGICA 2: VALIDAR CELULAR E SETAR ATIVO
  -- =========================================
  IF NEW.celular IS NOT NULL THEN
    -- Verificar se celular está no formato correto
    v_celular_valido := (NEW.celular ~ '^55[0-9]{11}$');
    
    IF v_celular_valido THEN
      NEW.ativo := true;
    ELSE
      NEW.ativo := false;
    END IF;
  ELSE
    NEW.ativo := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.atualizar_aluno_automatico() IS 
'Trigger function v1.0: Auto-preenche apelido com primeiro nome + valida celular e define ativo=true/false';
```

---

# 1. DEFINIÇÃO DAS TABELAS (CREATE TABLE)

## Tabela 1: alunos

```sql
CREATE TABLE public.alunos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nome_completo text NULL,
    apelido text NULL,
    email text NOT NULL UNIQUE,
    celular text NULL,
    cpf text NULL,
    data_compra timestamptz NULL,
    data_primeiro_acesso timestamptz NULL,
    data_ultimo_acesso timestamptz NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    contact_id_chatwoot integer NULL,
    tags_objetivos text[] DEFAULT '{}',
    tags_conquistas text[] DEFAULT '{}',
    id_externo integer UNIQUE,
    ativo boolean NOT NULL DEFAULT true,
    CONSTRAINT alunos_pkey PRIMARY KEY (id),
    CONSTRAINT alunos_email_key UNIQUE (email),
    CONSTRAINT alunos_id_externo_key UNIQUE (id_externo)
);

-- Índices para performance
CREATE INDEX idx_alunos_email ON public.alunos(email);
CREATE INDEX idx_alunos_ultimo_acesso ON public.alunos(data_ultimo_acesso);
CREATE INDEX idx_alunos_contact_chatwoot 
    ON public.alunos(contact_id_chatwoot)
    WHERE contact_id_chatwoot IS NOT NULL;
CREATE INDEX idx_alunos_tags_objetivos ON public.alunos USING GIN(tags_objetivos);
CREATE INDEX idx_alunos_tags_conquistas ON public.alunos USING GIN(tags_conquistas);
CREATE INDEX idx_alunos_id_externo ON public.alunos(id_externo);
CREATE INDEX idx_alunos_ativo 
    ON public.alunos(ativo) 
    WHERE ativo = true;

COMMENT ON TABLE alunos IS 'Cadastro de estudantes com dados pessoais, datas de acesso e status de elegibilidade para campanhas';
COMMENT ON COLUMN alunos.celular IS 'Formato esperado: 5531999998888 (DDI + DDD + 9 dígitos). Validação via trigger - permite salvar inválidos mas marca ativo=false. CHECK constraint removido em v2.8 (03/11/2025).';
COMMENT ON COLUMN alunos.ativo IS 'Status do aluno no sistema. true=ativo (celular válido), false=inativo (celular inválido ou ausente). Atualizado automaticamente via trigger_atualizar_aluno_automatico. Usado pelo workflow Run_Campaign para filtrar alunos elegíveis. Adicionado em v2.8 (03/11/2025).';
COMMENT ON COLUMN alunos.apelido IS 'Nome curto do aluno. Auto-preenchido com primeiro nome de nome_completo via trigger (v2.8). Pode ser customizado manualmente (trigger não sobrescreve se já preenchido).';
COMMENT ON COLUMN alunos.contact_id_chatwoot IS 'ID do contato no Chatwoot. Preenchido automaticamente na primeira interação (incoming ou outgoing). Evita múltiplas requisições à API Chatwoot.';
COMMENT ON COLUMN alunos.tags_objetivos IS 'Array de tags de objetivos do aluno (ex: objetivo-arrematar-casa). Tags Soberanas: Supabase é fonte única de verdade.';
COMMENT ON COLUMN alunos.tags_conquistas IS 'Array de tags de conquistas do aluno (ex: conquista-arrematou-imovel). Sincronizado com Chatwoot labels via workflow.';
COMMENT ON COLUMN alunos.id_externo IS 'ID do aluno no sistema externo Cademi (usuario.id do webhook). Usado pelo workflow [CS] Sync_External_Data para buscar aluno e atualizar progresso. Alunos cadastrados manualmente. Adicionado em v2.3 (02/11/2025).';
```

---

## Tabela 2: trilhas

```sql
CREATE TABLE public.trilhas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nome_trilha text NOT NULL,
    ordem integer NOT NULL,
    id_externo integer UNIQUE,
    ativo boolean DEFAULT true,
    CONSTRAINT trilhas_pkey PRIMARY KEY (id),
    CONSTRAINT trilhas_id_externo_key UNIQUE (id_externo)
);

CREATE INDEX idx_trilhas_id_externo ON public.trilhas(id_externo);

COMMENT ON TABLE trilhas IS 'Módulos/Etapas do curso (11 missões: Boas Vindas até Proposta Campeã)';
COMMENT ON COLUMN trilhas.id IS 'Chave primária UUID (migrado de INTEGER para UUID em 03/11/2025 - v2.5)';
COMMENT ON COLUMN trilhas.ordem IS 'Sequência: 1 a 11 (Missões 01-10 + Boas Vindas). ATENÇÃO: Removido UNIQUE constraint em 02/11/2025 - pode ter duplicatas se Cademi enviar produtos com mesma ordem.';
COMMENT ON COLUMN trilhas.id_externo IS 'ID do produto no sistema externo Cademi (produto.id do webhook). Adicionado em v2.3 (02/11/2025) para workflow [CS] Sync_External_Data.';
COMMENT ON COLUMN trilhas.ativo IS 'Flag: permite desativar trilhas antigas sem deletar (soft delete). Adicionado em v2.3 (02/11/2025).';
```

**📊 Dados de Seed (11 trilhas - Atualizado 03/11/2025):**

```sql
INSERT INTO public.trilhas (nome_trilha, ordem, id_externo, ativo) VALUES
('Boas Vindas', 1, 215609, true),
('Missão 01 - Domine as Regras do Jogo', 2, 215444, true),
('Missão 02 - Garimpe como um Hunter', 3, 481699, true),
('Missão 03 - Analise como Profissional', 4, 215445, true),
('Missão 04 - Entre em Campo', 5, 481694, true),
('Missão 05 - Faça o Gol', 6, 215598, true),
('Missão 06 - Desvendando o Sistema Judicial', 7, 481698, true),
('Missão 07 - Análise Técnica Profunda', 8, 295699, true),
('Missão 08 - Decifre Documentos Ocultos', 9, 215606, true),
('Missão 09 - A Mente por Trás dos Leiões', 10, 215607, true),
('Missão 10 - A Proposta Campeã', 11, 215608, true);
```

---

## Tabela 3: funis_globais

```sql
CREATE TABLE public.funis_globais (
    id serial NOT NULL,
    nome_funil text NOT NULL UNIQUE,
    CONSTRAINT funis_globais_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE funis_globais IS '5 tipos de saúde geral: Nunca Acessou, Recompra, Engajado, Desengajado, Primeiro Acesso';
```

**📊 Dados de Seed (5 funis globais):**

```sql
INSERT INTO funis_globais (id, nome_funil) VALUES
  (1, 'Nunca Acessou'),              -- Comprou mas nunca entrou na plataforma
  (2, 'Recompra'),                   -- Concluiu >60%, pode comprar próximo produto
  (3, 'Engajado (Geral)'),           -- Progresso >60% e ativo
  (4, 'Desengajado (Geral)'),        -- Inativo há >30 dias ou progresso <40%
  (5, 'Primeiro Acesso (Geral)');    -- Acabou de entrar, primeiras interações
```

---

## Tabela 4: funis_especificos

```sql
CREATE TABLE public.funis_especificos (
    id serial NOT NULL,
    nome_funil text NOT NULL UNIQUE,
    CONSTRAINT funis_especificos_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE funis_especificos IS '2 tipos de ritmo na trilha: Engajado (Trilha), Desengajado (Trilha)';
```

**📊 Dados de Seed (2 funis específicos):**

```sql
INSERT INTO funis_especificos (id, nome_funil) VALUES
  (1, 'Engajado (Trilha)'),      -- Progredindo bem na trilha atual
  (2, 'Desengajado (Trilha)');   -- Atrasado ou parado na trilha
```

---

## Tabela 5: templates

```sql
CREATE TABLE public.templates (
    id serial NOT NULL,
    template_id_whatsapp text NOT NULL UNIQUE,
    descricao text NULL,
    conteudo text NULL,
    trilha_id uuid NULL,
    funil_global_id integer NULL,
    funil_especifico_id integer NULL,
    ativo boolean NOT NULL DEFAULT true,
    
    CONSTRAINT templates_pkey PRIMARY KEY (id),
    CONSTRAINT fk_templates_trilha FOREIGN KEY (trilha_id) 
        REFERENCES public.trilhas(id) ON DELETE CASCADE,
    CONSTRAINT fk_funil_global FOREIGN KEY (funil_global_id) 
        REFERENCES public.funis_globais(id) ON DELETE CASCADE,
    CONSTRAINT fk_funil_especifico FOREIGN KEY (funil_especifico_id) 
        REFERENCES public.funis_especificos(id) ON DELETE CASCADE,
    
    -- Garante que template é GLOBAL (tem funil_global_id) ou ESPECÍFICO (tem trilha_id + funil_especifico_id)
    CONSTRAINT check_template_tipo CHECK (
        (funil_global_id IS NOT NULL AND trilha_id IS NULL AND funil_especifico_id IS NULL)
        OR
        (funil_global_id IS NULL AND trilha_id IS NOT NULL AND funil_especifico_id IS NOT NULL)
    )
);

-- Índices para performance (NÃO IMPLEMENTADOS - tabela pequena, desnecessário)
-- CREATE INDEX idx_templates_funil_global 
--     ON public.templates(funil_global_id) 
--     WHERE funil_global_id IS NOT NULL;
-- CREATE INDEX idx_templates_trilha_especifico 
--     ON public.templates(trilha_id, funil_especifico_id) 
--     WHERE trilha_id IS NOT NULL;
-- CREATE INDEX idx_templates_ativo 
--     ON public.templates(ativo) 
--     WHERE ativo = true;
-- MOTIVO: Tabela pequena (~25 templates), PostgreSQL usa seq scan (mais rápido que índice)

COMMENT ON TABLE templates IS 'Mensagens WhatsApp pré-aprovadas (v2.7: 3 globais + 22 específicos = 25 templates). Templates específicos são criados AUTOMATICAMENTE via trigger quando nova trilha é inserida.';
COMMENT ON COLUMN templates.template_id_whatsapp IS 'ID do template aprovado na Meta WhatsApp. UNIQUE constraint removido em v2.7 - múltiplos templates podem usar mesmo ID (ex: "base"). Diferenciação via trilha_id + funil_especifico_id.';
COMMENT ON COLUMN templates.trilha_id IS 'Referência UUID para trilhas.id (migrado de INTEGER para UUID em 03/11/2025 - v2.5)';
COMMENT ON COLUMN templates.ativo IS 'Permite A/B tests: desativar template sem deletar. Templates criados via trigger são INATIVOS por padrão (ativo=false) até revisão manual.';
COMMENT ON COLUMN templates.conteudo IS 'Conteúdo do template WhatsApp com placeholders {{1}} e {{2}}. Usado para espelhar mensagem no Chatwoot. Exemplo: "Olá {{1}}, como está a {{2}}?". Templates auto-criados usam: "Oi *{{1}}* ,tudo bem com você???"';
```

---

## Tabela 6: progresso_alunos

```sql
CREATE TABLE public.progresso_alunos (
    aluno_id uuid NOT NULL,
    trilha_id uuid NOT NULL,
    percentual_progresso float4 NOT NULL DEFAULT 0,
    data_atualizacao timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT progresso_alunos_pkey PRIMARY KEY (aluno_id, trilha_id),
    CONSTRAINT progresso_alunos_aluno_id_fkey 
        FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE,
    CONSTRAINT fk_progresso_trilha 
        FOREIGN KEY (trilha_id) REFERENCES public.trilhas(id) ON DELETE CASCADE
);

COMMENT ON TABLE progresso_alunos IS 'Avanço do aluno por trilha (chave composta: aluno + trilha)';
COMMENT ON COLUMN progresso_alunos.trilha_id IS 'Referência UUID para trilhas.id (migrado de INTEGER para UUID em 03/11/2025 - v2.5)';
```

---

## Tabela 7: campanhas

```sql
CREATE TABLE public.campanhas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    trilha_foco_id uuid NULL,
    data_inicio timestamptz NOT NULL DEFAULT now(),
    data_fim timestamptz NULL,
    status text NOT NULL,
    total_processados integer NULL,
    total_sucesso integer NULL,
    
    CONSTRAINT campanhas_pkey PRIMARY KEY (id),
    CONSTRAINT campanhas_trilha_foco_id_fkey 
        FOREIGN KEY (trilha_foco_id) REFERENCES public.trilhas(id)
);

COMMENT ON TABLE campanhas IS 'Registro de cada execução de disparo (uma campanha = um disparo para uma trilha específica)';
COMMENT ON COLUMN campanhas.status IS 'Valores: processando, concluido, falha';
COMMENT ON COLUMN campanhas.trilha_foco_id IS 'Trilha específica sendo disparada (migrado de INTEGER para UUID em 03/11/2025 - v2.5)';
```

---

## Tabela 8: logs_envios

```sql
CREATE TABLE public.logs_envios (
    id bigserial NOT NULL,
    campanha_id uuid NOT NULL,
    aluno_id uuid NOT NULL,
    template_id integer NOT NULL,
    status text NOT NULL,
    data_envio timestamptz NOT NULL DEFAULT now(),
    detalhes_erro text NULL,
    
    -- ⭐ v2.0 Chatwoot Integration
    conversa_id_chatwoot UUID NULL,
    mensagem_id_chatwoot TEXT NULL,
    status_entrega VARCHAR(20) DEFAULT 'pending',
    
    CONSTRAINT logs_envios_pkey PRIMARY KEY (id),
    CONSTRAINT logs_envios_campanha_id_fkey 
        FOREIGN KEY (campanha_id) REFERENCES public.campanhas(id),
    CONSTRAINT logs_envios_aluno_id_fkey 
        FOREIGN KEY (aluno_id) REFERENCES public.alunos(id),
    CONSTRAINT logs_envios_template_id_fkey 
        FOREIGN KEY (template_id) REFERENCES public.templates(id),
    CONSTRAINT fk_logs_conversa_chatwoot 
        FOREIGN KEY (conversa_id_chatwoot) REFERENCES public.conversas_chatwoot(id) ON DELETE SET NULL
);

-- Índice para performance Chatwoot
CREATE INDEX idx_logs_conversa_chatwoot 
    ON logs_envios(conversa_id_chatwoot)
    WHERE conversa_id_chatwoot IS NOT NULL;

COMMENT ON TABLE logs_envios IS 'Auditoria completa: cada mensagem enviada gera 1 log';
COMMENT ON COLUMN logs_envios.conversa_id_chatwoot IS '[v2.0] Link para conversa no Chatwoot (se enviado via Chatwoot)';
COMMENT ON COLUMN logs_envios.mensagem_id_chatwoot IS '[v2.0] ID da mensagem no Chatwoot para rastreamento';
COMMENT ON COLUMN logs_envios.status_entrega IS '[v2.0] Status: pending, sent, delivered, read, failed';
```

---

## Tabela 9: snapshots_alunos_campanhas

```sql
CREATE TABLE public.snapshots_alunos_campanhas (
    id bigserial NOT NULL,
    campanha_id uuid NOT NULL,
    aluno_id uuid NOT NULL,
    trilha_foco_id uuid NULL,
    funil_global_id integer NULL,
    funil_trilha_id integer NULL,
    data_classificacao timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT snapshots_alunos_campanhas_pkey PRIMARY KEY (id),
    CONSTRAINT fk_campanha FOREIGN KEY (campanha_id) 
        REFERENCES public.campanhas(id) ON DELETE CASCADE,
    CONSTRAINT fk_aluno FOREIGN KEY (aluno_id) 
        REFERENCES public.alunos(id) ON DELETE CASCADE,
    CONSTRAINT fk_trilha FOREIGN KEY (trilha_foco_id) 
        REFERENCES public.trilhas(id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_funil_global FOREIGN KEY (funil_global_id) 
        REFERENCES public.funis_globais(id),
    CONSTRAINT fk_ss_funil_trilha FOREIGN KEY (funil_trilha_id) 
        REFERENCES public.funis_especificos(id),
    UNIQUE (campanha_id, aluno_id)
);

COMMENT ON TABLE snapshots_alunos_campanhas IS 'Business Intelligence: fotografia do aluno no momento da campanha';
COMMENT ON COLUMN snapshots_alunos_campanhas.funil_trilha_id IS 'Renomeado de especifico para trilha para clareza';
COMMENT ON COLUMN snapshots_alunos_campanhas.trilha_foco_id IS 'Trilha que está sendo disparada nesta campanha (migrado de INTEGER para UUID em 03/11/2025 - v2.5)';
```

---

## Tabela 10: conversas_chatwoot ⭐ (v2.0 - NOVA)

```sql
CREATE TABLE IF NOT EXISTS public.conversas_chatwoot (
    -- Identificação interna
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL,
    
    -- IDs do Chatwoot (mapeamento completo)
    conversation_id_chatwoot TEXT NOT NULL UNIQUE,
    contact_id_chatwoot TEXT NOT NULL,
    
    -- Status e metadados Chatwoot
    status_conversa TEXT NOT NULL DEFAULT 'open',
    -- Valores possíveis: 'open', 'resolved', 'pending', 'snoozed'
    
    agente_id_chatwoot TEXT,
    -- null = atendimento bot
    -- número = agente humano (ID no Chatwoot)
    
    equipe_id_chatwoot TEXT,
    -- ID da equipe no Chatwoot (se aplicável)
    
    canal VARCHAR(20) DEFAULT 'whatsapp',
    -- Valores possíveis: 'whatsapp', 'email', 'webchat', etc.
    
    -- ⭐ SISTEMA DE MEMÓRIA HIERÁRQUICA (3 Níveis) ⭐
    
    -- NÍVEL 1: MEMÓRIA DE LONGO PRAZO
    contexto_historico TEXT,
    -- Resumo das Últimas 5 conversas resolvidas (6 meses)
    -- Formato: "• DD/MM/YYYY: [200 chars do resumo_final]" separados por \n
    -- Gerado 1x quando conversa nova abre (INSERT apenas, não UPDATE)
    -- Fallback: "Primeira conversa com este cliente"
    -- Tamanho: ~1000 chars (5 x 200 + datas + bullets)
    
    -- NÍVEL 2: MEMÓRIA DE TRABALHO
    resumo_evolutivo TEXT,
    -- Resumo da conversa ATUAL (atualizado mensagem a mensagem)
    -- Gerado/atualizado: CADA mensagem nova
    -- Tamanho: ~500 tokens (cresce durante conversa)
    
    -- NÍVEL 3: MEMÓRIA CONSOLIDADA
    resumo_final TEXT,
    -- Condensação completa quando conversa resolve
    -- Gerado 1x quando status = 'resolved'
    -- Tamanho: ~300 tokens
    
    -- Timestamps
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_ultima_interacao TIMESTAMPTZ,
    data_resolucao TIMESTAMPTZ,
    -- Preenchido quando status_conversa vira 'resolved'
    
    -- Foreign Key
    CONSTRAINT fk_aluno 
        FOREIGN KEY (aluno_id) 
        REFERENCES alunos(id) 
        ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_conversas_aluno 
    ON conversas_chatwoot(aluno_id);
CREATE INDEX idx_conversas_status 
    ON conversas_chatwoot(status_conversa);
CREATE INDEX idx_conversas_chatwoot_id 
    ON conversas_chatwoot(conversation_id_chatwoot);
CREATE INDEX idx_conversas_data_criacao 
    ON conversas_chatwoot(data_criacao DESC);

-- Comentários para documentação
COMMENT ON TABLE conversas_chatwoot IS 
'[v2.0] Sistema de Memória Hierárquica (3 níveis: contexto_historico, resumo_evolutivo, resumo_final)';
COMMENT ON COLUMN conversas_chatwoot.contexto_historico IS 
'Nível 1 - Long-term Memory: Últimas 5 conversas resolvidas (6 meses). Formato: "• DD/MM/YYYY: [200 chars]". Populado em INSERT, não UPDATE';
COMMENT ON COLUMN conversas_chatwoot.resumo_evolutivo IS 
'Nível 2 - Working Memory: Resumo da conversa atual (atualizado mensagem a mensagem)';
COMMENT ON COLUMN conversas_chatwoot.resumo_final IS 
'Nível 3 - Consolidated Memory: Condensação final quando conversa resolve';
```

---

## Tabela 11: mensagens_chatwoot ⭐ (v2.1 - SIMPLIFICADA)

```sql
CREATE TABLE public.mensagens_chatwoot (
    -- Identificação interna
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    
    -- Relacionamento com conversa
    conversa_id UUID NOT NULL,
    
    -- IDs do Chatwoot (opcional - para rastreamento)
    message_id_chatwoot TEXT NULL,
    
    -- Conteúdo da mensagem (já textualizado)
    conteudo TEXT NOT NULL,
    
    -- Tipo e direção
    tipo_mensagem VARCHAR(20) NOT NULL,
    -- 'incoming' = cliente enviou
    -- 'outgoing' = bot/humano enviou
    
    -- Identificação do remetente (SIMPLIFICADO v2.1)
    agent_id TEXT NULL,
    -- NULL = cliente enviou
    -- "3" = bot enviou
    -- Outro ID = agente humano enviou
    
    is_agent BOOLEAN NOT NULL DEFAULT false,
    -- false = cliente enviou
    -- true = agente (bot ou humano) enviou
    
    -- Timestamp
    data_envio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT mensagens_chatwoot_pkey PRIMARY KEY (id),
    CONSTRAINT fk_conversa 
        FOREIGN KEY (conversa_id) 
        REFERENCES conversas_chatwoot(id) 
        ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa 
    ON mensagens_chatwoot USING BTREE (conversa_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_data 
    ON mensagens_chatwoot USING BTREE (data_envio DESC);
CREATE INDEX IF NOT EXISTS idx_mensagens_is_agent 
    ON mensagens_chatwoot USING BTREE (is_agent);

-- Comentários para documentação
COMMENT ON TABLE mensagens_chatwoot IS 
'[v2.1 SIMPLIFICADA] Histórico completo 1:1 de mensagens. Conteúdo sempre textualizado (áudio/imagem convertidos pela Tool Processamento MSG).';
COMMENT ON COLUMN mensagens_chatwoot.is_agent IS 
'false = cliente enviou | true = agente (bot ou humano) enviou';
COMMENT ON COLUMN mensagens_chatwoot.agent_id IS 
'NULL = cliente | "3" = bot | Outro ID = humano';
COMMENT ON COLUMN mensagens_chatwoot.tipo_mensagem IS 
'Direção: incoming (cliente→sistema) ou outgoing (sistema→cliente)';
```

---

## Tabela 12: tags_disponiveis ⭐ (v2.2 - NOVA)

```sql
CREATE TABLE public.tags_disponiveis (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('objetivo', 'conquista')),
    tag_key VARCHAR(100) NOT NULL UNIQUE,
    tag_label VARCHAR(200) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance (NÃO IMPLEMENTADOS - tabela pequena, desnecessário)
-- CREATE INDEX idx_tags_categoria 
--     ON public.tags_disponiveis(categoria) 
--     WHERE ativo = true;
-- CREATE INDEX idx_tags_ativo 
--     ON public.tags_disponiveis(ativo);
-- MOTIVO: Apenas 20 tags estáticas, função get_tags_para_prompt() roda <1ms sem índice

-- Comentários para documentação
COMMENT ON TABLE tags_disponiveis IS 
'Catálogo centralizado de tags disponíveis. Tags Soberanas: Supabase é fonte única de verdade, Chatwoot apenas espelha labels.';

COMMENT ON COLUMN tags_disponiveis.categoria IS 
'Tipo da tag: "objetivo" (metas do aluno) ou "conquista" (achievements alcançados)';

COMMENT ON COLUMN tags_disponiveis.tag_key IS 
'Identificador único da tag (ex: objetivo-arrematar-casa, conquista-arrematou-imovel)';

COMMENT ON COLUMN tags_disponiveis.tag_label IS 
'Label formatada com emoji para exibição (ex: 🎯 Arrematar Casa, 🏆 Arrematou Imóvel)';
```

### 📊 Tags Iniciais (20 registros)

#### 🎯 Objetivos (10 tags)

| tag_key | tag_label | descricao |
|---------|-----------|-----------|
| objetivo-aprender | 🎯 Aprender | Foco em aprender sobre leilões |
| objetivo-arrematar-casa | 🎯 Arrematar Casa | Quer arrematar imóvel para morar |
| objetivo-casa-praia | 🎯 Casa Praia/Campo | Quer segunda residência |
| objetivo-diversificar | 🎯 Diversificar | Quer adicionar imóveis ao portfólio |
| objetivo-flip-imovel | 🎯 Flip | Quer comprar e revender rápido |
| objetivo-imovel-comercial | 🎯 Imóvel Comercial | Interesse em imóveis comerciais |
| objetivo-investimento | 🎯 Investimento | Quer investir em imóveis |
| objetivo-negocio-familiar | 🎯 Negócio Familiar | Imóvel para negócio da família |
| objetivo-primeira-propriedade | 🎯 1ª Propriedade | Busca primeira casa própria |
| objetivo-renda-passiva | 🎯 Renda Passiva | Quer gerar renda com aluguéis |

#### 🏆 Conquistas (10 tags)

| tag_key | tag_label | descricao |
|---------|-----------|-----------|
| arrematou-imovel | ✅ Arrematou | Arrematou pelo menos um imóvel |
| concluiu-modulo-1 | ✅ Módulo 1 | Concluiu módulo de fundamentos |
| concluiu-modulo-2 | ✅ Módulo 2 | Concluiu módulo de análise |
| concluiu-modulo-3 | ✅ Módulo 3 | Concluiu módulo avançado |
| mentor-ativo | ✅ Mentor | Aluno engajado que ajuda outros |
| multiplas-arrematacoes | ✅ Múltiplas | Arrematou 3+ imóveis |
| primeira-proposta | ✅ 1ª Proposta | Fez primeira proposta em leilão |
| primeiro-lucro | ✅ 1º Lucro | Teve lucro na primeira transação |
| primeiro-negocio | ✅ 1º Negócio | Fechou primeiro negócio |
| visitou-imovel | ✅ 1ª Visita | Visitou primeiro imóvel de leilão |

**📊 Script de Seed (20 tags):**

```sql
-- 10 OBJETIVOS (metas do aluno)
INSERT INTO tags_disponiveis (categoria, tag_key, tag_label, descricao, ativo) VALUES
  ('objetivo', 'objetivo-arrematar-casa', '🎯 Arrematar Casa', 'Quer arrematar imóvel para morar', true),
  ('objetivo', 'objetivo-investimento', '🎯 Investimento', 'Quer investir em imóveis', true),
  ('objetivo', 'objetivo-renda-passiva', '🎯 Renda Passiva', 'Quer gerar renda com aluguéis', true),
  ('objetivo', 'objetivo-flip-imovel', '🎯 Flip', 'Quer comprar e revender rápido', true),
  ('objetivo', 'objetivo-primeira-propriedade', '🎯 1ª Propriedade', 'Busca primeira casa própria', true),
  ('objetivo', 'objetivo-diversificar', '🎯 Diversificar', 'Quer adicionar imóveis ao portfólio', true),
  ('objetivo', 'objetivo-imovel-comercial', '🎯 Imóvel Comercial', 'Interesse em imóveis comerciais', true),
  ('objetivo', 'objetivo-aprender', '🎯 Aprender', 'Foco em aprender sobre leilões', true),
  ('objetivo', 'objetivo-casa-praia', '🎯 Casa Praia/Campo', 'Quer segunda residência', true),
  ('objetivo', 'objetivo-negocio-familiar', '🎯 Negócio Familiar', 'Imóvel para negócio da família', true);

-- 10 CONQUISTAS (achievements alcançados)
INSERT INTO tags_disponiveis (categoria, tag_key, tag_label, descricao, ativo) VALUES
  ('conquista', 'arrematou-imovel', '✅ Arrematou', 'Arrematou pelo menos um imóvel', true),
  ('conquista', 'primeira-proposta', '✅ 1ª Proposta', 'Fez primeira proposta em leilão', true),
  ('conquista', 'visitou-imovel', '✅ 1ª Visita', 'Visitou primeiro imóvel de leilão', true),
  ('conquista', 'concluiu-modulo-1', '✅ Módulo 1', 'Concluiu módulo de fundamentos', true),
  ('conquista', 'concluiu-modulo-2', '✅ Módulo 2', 'Concluiu módulo de análise', true),
  ('conquista', 'concluiu-modulo-3', '✅ Módulo 3', 'Concluiu módulo avançado', true),
  ('conquista', 'primeiro-negocio', '✅ 1º Negócio', 'Fechou primeiro negócio', true),
  ('conquista', 'primeiro-lucro', '✅ 1º Lucro', 'Teve lucro na primeira transação', true),
  ('conquista', 'multiplas-arrematacoes', '✅ Múltiplas', 'Arrematou 3+ imóveis', true),
  ('conquista', 'mentor-ativo', '✅ Mentor', 'Aluno engajado que ajuda outros', true);
```

### 🔄 Arquitetura Tags Soberanas

**Supabase = Fonte Única de Verdade**
- Tags armazenadas em `alunos.tags_objetivos[]` e `alunos.tags_conquistas[]`
- Arrays PostgreSQL com índices GIN para busca eficiente
- Modificadas apenas via workflow N8N (Node 3.6.8)

**Chatwoot = Espelhamento (Read-Only)**
- Labels sincronizados via API (Node 3.6.9)
- Apenas para visualização e filtragem na interface
- Não pode modificar tags direto no Chatwoot

**Fluxo de Sincronização:**
1. AI Agent identifica tags na conversa (Node 3.6.5 Supervisor)

---

## Tabela 13: webhook_logs ⭐ (v2.4 - NOVA)

```sql
CREATE TABLE public.webhook_logs (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    id_externo_usuario INTEGER NULL,
    id_externo_produto INTEGER NULL,
    status_code INTEGER NOT NULL,
    error_message TEXT NULL,
    payload JSONB NOT NULL,
    data_recebimento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_status_code CHECK (status_code IN (200, 400, 404, 500))
);

-- Índices para performance
CREATE INDEX idx_webhook_logs_status 
    ON public.webhook_logs(status_code);

CREATE INDEX idx_webhook_logs_data 
    ON public.webhook_logs(data_recebimento DESC);

CREATE INDEX idx_webhook_logs_usuario 
    ON public.webhook_logs(id_externo_usuario) 
    WHERE id_externo_usuario IS NOT NULL;

CREATE INDEX idx_webhook_logs_produto 
    ON public.webhook_logs(id_externo_produto) 
    WHERE id_externo_produto IS NOT NULL;

-- Comentários para documentação
COMMENT ON TABLE webhook_logs IS 
'Auditoria completa de webhooks recebidos do Cademi. Permite análise de taxa de sucesso, debug de falhas e rastreabilidade de eventos. Usado pelo workflow [CS] Sync_External_Data.';

COMMENT ON COLUMN webhook_logs.event_type IS 
'Tipo do evento recebido (ex: usuario.progresso). Valor vindo de payload.event_type.';

COMMENT ON COLUMN webhook_logs.id_externo_usuario IS 
'ID do usuário no sistema externo Cademi (payload.event.usuario.id). NULL se payload inválido.';

COMMENT ON COLUMN webhook_logs.id_externo_produto IS 
'ID do produto no sistema externo Cademi (payload.event.produto.id). NULL se payload inválido.';

COMMENT ON COLUMN webhook_logs.status_code IS 
'Código HTTP retornado ao Cademi: 200 (sucesso), 400 (payload inválido), 404 (aluno/trilha não cadastrado), 500 (erro interno).';

COMMENT ON COLUMN webhook_logs.error_message IS 
'Mensagem de erro detalhada. NULL se status_code = 200. Exemplos: "Aluno não cadastrado", "Payload inválido".';

COMMENT ON COLUMN webhook_logs.payload IS 
'Payload completo do webhook em formato JSONB para debug. Permite busca por campos específicos usando operadores JSONB do PostgreSQL.';

COMMENT ON COLUMN webhook_logs.data_recebimento IS 
'Timestamp de recebimento do webhook. Usado para análise temporal e limpeza de logs antigos.';
```

### 📊 Queries Úteis para Análise

#### Taxa de Sucesso
```sql
SELECT 
    status_code,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentual
FROM webhook_logs
WHERE data_recebimento >= NOW() - INTERVAL '7 days'
GROUP BY status_code
ORDER BY total DESC;
```

#### Alunos Não Cadastrados (Top 10)
```sql
SELECT 
    id_externo_usuario,
    COUNT(*) as tentativas,
    MAX(data_recebimento) as ultima_tentativa,
    payload->'event'->'usuario'->>'nome' as nome_usuario
FROM webhook_logs
WHERE status_code = 404 
  AND error_message LIKE '%Aluno%'
  AND data_recebimento >= NOW() - INTERVAL '30 days'
GROUP BY id_externo_usuario, payload->'event'->'usuario'->>'nome'
ORDER BY tentativas DESC
LIMIT 10;
```

#### Trilhas Não Cadastradas (Top 10)
```sql
SELECT 
    id_externo_produto,
    COUNT(*) as tentativas,
    MAX(data_recebimento) as ultima_tentativa,
    payload->'event'->'produto'->>'nome' as nome_produto
FROM webhook_logs
WHERE status_code = 404 
  AND error_message LIKE '%Trilha%'
  AND data_recebimento >= NOW() - INTERVAL '30 days'
GROUP BY id_externo_produto, payload->'event'->'produto'->>'nome'
ORDER BY tentativas DESC
LIMIT 10;
```

#### Webhooks por Hora (Últimas 24h)
```sql
SELECT 
    DATE_TRUNC('hour', data_recebimento) as hora,
    COUNT(*) as total_webhooks,
    SUM(CASE WHEN status_code = 200 THEN 1 ELSE 0 END) as sucessos,
    SUM(CASE WHEN status_code != 200 THEN 1 ELSE 0 END) as erros
FROM webhook_logs
WHERE data_recebimento >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', data_recebimento)
ORDER BY hora DESC;
```

### 🗑️ Política de Retenção (Opcional)

```sql
-- Deletar logs antigos (manter últimos 90 dias)
DELETE FROM webhook_logs 
WHERE data_recebimento < NOW() - INTERVAL '90 days';

-- Ou criar função de limpeza automática
CREATE OR REPLACE FUNCTION limpar_webhook_logs_antigos()
RETURNS void AS $$
BEGIN
    DELETE FROM webhook_logs 
    WHERE data_recebimento < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Agendar execução semanal (usar pg_cron ou fazer via N8N)
```

---

**Fluxo de Sincronização:**
1. AI Agent identifica tags na conversa (Node 3.6.5 Supervisor)
2. Sistema calcula tags finais (Node 3.6.7)
3. UPDATE em `alunos` (Node 3.6.8)
4. Sincroniza labels no Chatwoot (Node 3.6.9)

---

# 2. FUNÇÕES SQL

## get_tags_para_prompt() ⭐ (v2.2 - NOVA)

**🎯 Propósito:** Retorna lista formatada de todas as tags disponíveis para uso no prompt do AI Agent  
**📊 Output:** JSON com arrays de objetivos e conquistas  
**⚡ Performance:** ~5ms (consulta simples com cache)

```sql
-- =====================================================================
-- FUNÇÃO: get_tags_para_prompt()
-- =====================================================================
-- Uso: SELECT * FROM get_tags_para_prompt();
-- Output: JSON com categorias e arrays de tags
-- =====================================================================

CREATE OR REPLACE FUNCTION get_tags_para_prompt()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'objetivos', (
      SELECT json_agg(tag_info ORDER BY tag_info->>'key')
      FROM (
        SELECT json_build_object(
          'key', tag_key,
          'label', tag_label,
          'descricao', descricao
        ) as tag_info
        FROM tags_disponiveis
        WHERE categoria = 'objetivo' AND ativo = true
      ) objetivos_subquery
    ),
    'conquistas', (
      SELECT json_agg(tag_info ORDER BY tag_info->>'key')
      FROM (
        SELECT json_build_object(
          'key', tag_key,
          'label', tag_label,
          'descricao', descricao
        ) as tag_info
        FROM tags_disponiveis
        WHERE categoria = 'conquista' AND ativo = true
      ) conquistas_subquery
    )
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_tags_para_prompt() IS 
'Retorna JSON com lista completa de tags disponíveis (objetivos e conquistas) para uso no prompt do AI Agent. Inclui apenas tags ativas.';
```

### 📋 Exemplo de Output

```json
{
  "objetivos": [
    {"key": "objetivo-arrematar-casa", "label": "🎯 Arrematar Casa", "descricao": "..."},
    {"key": "objetivo-investimento", "label": "🎯 Investimento", "descricao": "..."}
  ],
  "conquistas": [
    {"key": "arrematou-imovel", "label": "✅ Arrematou", "descricao": "..."},
    {"key": "primeira-proposta", "label": "✅ 1ª Proposta", "descricao": "..."}
  ]
}
```

---

## buscar_dossie_cs() v2.2 ⭐ ATUALIZADA

**🎯 O QUE MUDOU v2.2:** Adiciona campo `ativo` no JSON do aluno (v2.8 - 03/11/2025)  
**🎯 O QUE MUDOU v2.1:** Usa snapshot mais recente ao invés de recalcular funil  
**📈 Performance:** ~10ms (vs ~50-100ms da v2.0)  
**🎯 Single Source of Truth:** Lógica de classificação centralizada no Workflow Run_Campaign

```sql
-- =====================================================================
-- FUNÇÃO: buscar_dossie_cs() v2.2
-- =====================================================================
-- Propósito: Retorna dossiê completo do aluno para contexto do bot CS
-- 
-- Retorna:
-- - Dados do aluno (nome, email, progresso, ativo, etc.)
-- - Classificação de funil (DO SNAPSHOT MAIS RECENTE ⭐)
-- - Sistema de Memória Hierárquica (3 níveis)
-- =====================================================================

CREATE OR REPLACE FUNCTION buscar_dossie_cs(p_aluno_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Verificar se aluno existe
  IF NOT EXISTS (SELECT 1 FROM alunos WHERE id = p_aluno_id) THEN
    RETURN json_build_object(
      'erro', 'Aluno não encontrado',
      'aluno_id', p_aluno_id
    );
  END IF;
  
  -- Montar dossiê completo
  SELECT json_build_object(
    -- ========== DADOS DO ALUNO ==========
    'aluno', json_build_object(
      'id', a.id,
      'nome_completo', a.nome_completo,
      'apelido', a.apelido,
      'email', a.email,
      'celular', a.celular,
      'ativo', a.ativo,
      'data_primeiro_acesso', a.data_primeiro_acesso,
      'data_ultimo_acesso', a.data_ultimo_acesso,
      'criado_em', a.criado_em
    ),
    
    -- ========== PROGRESSO ATUAL ==========
    'progresso_geral', COALESCE(
      (SELECT AVG(percentual_progresso) 
       FROM progresso_alunos 
       WHERE aluno_id = a.id),
      0
    ),
    
    'progresso_por_trilha', COALESCE(
      (SELECT json_agg(json_build_object(
        'trilha_id', t.id,
        'trilha_nome', t.nome_trilha,
        'ordem', t.ordem,
        'progresso_percentual', pa.percentual_progresso,
        'data_atualizacao', pa.data_atualizacao
      ) ORDER BY t.ordem)
      FROM progresso_alunos pa
      JOIN trilhas t ON pa.trilha_id = t.id
      WHERE pa.aluno_id = a.id),
      '[]'::json
    ),
    
    -- ========== CLASSIFICAÇÃO DE FUNIL (DO SNAPSHOT MAIS RECENTE) ⭐ ==========
    'classificacao_funil', COALESCE(
      (SELECT json_build_object(
        -- Funil Global
        'funil_global_id', fg.id,
        'funil_global_nome', fg.nome_funil,
        
        -- Funil da Trilha (específico)
        'funil_trilha_id', fe.id,
        'funil_trilha_nome', fe.nome_funil,
        
        -- Metadados do Snapshot
        'trilha_foco_id', tr.id,
        'trilha_foco_nome', tr.nome_trilha,
        'data_classificacao', ss.data_classificacao,
        'campanha_id', ss.campanha_id,
        
        -- Contexto
        'fonte', 'snapshot_mais_recente',
        'descricao', 'Classificação salva pelo Workflow Run_Campaign'
      )
      FROM snapshots_alunos_campanhas ss
      LEFT JOIN funis_globais fg ON ss.funil_global_id = fg.id
      LEFT JOIN funis_especificos fe ON ss.funil_trilha_id = fe.id
      LEFT JOIN trilhas tr ON ss.trilha_foco_id = tr.id
      WHERE ss.aluno_id = a.id
      ORDER BY ss.data_classificacao DESC
      LIMIT 1),
      json_build_object(
        'funil_global_id', null,
        'funil_global_nome', 'Não classificado',
        'funil_trilha_id', null,
        'funil_trilha_nome', null,
        'fonte', 'nenhum_snapshot',
        'descricao', 'Aluno ainda não participou de nenhuma campanha'
      )
    ),
    
    -- ========== SISTEMA DE MEMÓRIA HIERÁRQUICA ⭐ ==========
    'memoria_hierarquica', COALESCE(
      (SELECT json_build_object(
        -- NÍVEL 1: Long-term Memory (conversas antigas)
        'contexto_historico', cc.contexto_historico,
        
        -- NÍVEL 2: Working Memory (conversa atual)
        'resumo_evolutivo', cc.resumo_evolutivo,
        
        -- NÍVEL 3: Consolidated Memory (última conversa resolvida)
        'resumo_final', cc.resumo_final,
        
        -- Metadados da conversa atual
        'conversa_atual', json_build_object(
          'id', cc.id,
          'conversation_id_chatwoot', cc.conversation_id_chatwoot,
          'status', cc.status_conversa,
          'agente_humano', cc.agente_id_chatwoot IS NOT NULL,
          'agente_id', cc.agente_id_chatwoot,
          'canal', cc.canal,
          'data_criacao', cc.data_criacao,
          'data_ultima_interacao', cc.data_ultima_interacao
        ),
        
        -- Total de conversas anteriores
        'total_conversas_resolvidas', (
          SELECT COUNT(*) 
          FROM conversas_chatwoot 
          WHERE aluno_id = a.id 
            AND status_conversa = 'resolved'
        )
      )
      FROM conversas_chatwoot cc
      WHERE cc.aluno_id = a.id
        AND cc.status_conversa != 'resolved'
      ORDER BY cc.data_criacao DESC
      LIMIT 1),
      json_build_object(
        'contexto_historico', null,
        'resumo_evolutivo', null,
        'resumo_final', null,
        'conversa_atual', null,
        'total_conversas_resolvidas', (
          SELECT COUNT(*) 
          FROM conversas_chatwoot 
          WHERE aluno_id = a.id 
            AND status_conversa = 'resolved'
        )
      )
    )
    
  ) INTO v_result
  FROM alunos a
  WHERE a.id = p_aluno_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Grant para N8N/aplicação executar
GRANT EXECUTE ON FUNCTION buscar_dossie_cs(UUID) TO authenticated;

COMMENT ON FUNCTION buscar_dossie_cs IS 
'v2.2 ATUALIZADA: Retorna dossiê completo do aluno usando snapshot mais recente (Single Source of Truth). Inclui campo ativo (v2.8). Performance: ~10ms. Inclui Sistema de Memória Hierárquica (3 níveis).';
```

**Exemplo de uso:**
```sql
-- Buscar dossiê de um aluno
SELECT buscar_dossie_cs('550e8400-e29b-41d4-a716-446655440000');

-- Output esperado (JSON):
{
  "aluno": { ... },
  "progresso_geral": 45.5,
  "progresso_por_trilha": [ ... ],
  "classificacao_funil": {
    "funil_global_nome": "Engajado (Geral)",
    "funil_trilha_nome": "Desengajado (Trilha)",
    "fonte": "snapshot_mais_recente"
  },
  "memoria_hierarquica": {
    "contexto_historico": "Out/2025: Problema boleto...",
    "resumo_evolutivo": "Cliente perguntou sobre módulo 3...",
    "conversa_atual": { ... }
  }
}
```

---

# 3. SCRIPTS

## Script 1: Seeding (Dados de Teste)

**📋 Propósito:** Inserir dados iniciais necessários para MVP  
**⚠️ IMPORTANTE:** Execute APENAS em banco vazio ou após reset

```sql
-- =====================================================================
-- SCRIPT 1: Inserção de Dados de Teste (Seeding)
-- =====================================================================

BEGIN;

-- 1. Inserir TRILHAS (Atualizado 03/11/2025 - 11 missões com id_externo)
INSERT INTO public.trilhas (nome_trilha, ordem, id_externo, ativo) VALUES
('Boas Vindas', 1, 215609, true),
('Missão 01 - Domine as Regras do Jogo', 2, 215444, true),
('Missão 02 - Garimpe como um Hunter', 3, 481699, true),
('Missão 03 - Analise como Profissional', 4, 215445, true),
('Missão 04 - Entre em Campo', 5, 481694, true),
('Missão 05 - Faça o Gol', 6, 215598, true),
('Missão 06 - Desvendando o Sistema Judicial', 7, 481698, true),
('Missão 07 - Análise Técnica Profunda', 8, 295699, true),
('Missão 08 - Decifre Documentos Ocultos', 9, 215606, true),
('Missão 09 - A Mente por Trás dos Leiões', 10, 215607, true),
('Missão 10 - A Proposta Campeã', 11, 215608, true);

-- 2. Inserir FUNIS GLOBAIS (5 tipos)
INSERT INTO public.funis_globais (nome_funil) VALUES
('Nunca Acessou'),
('Recompra'),
('Engajado (Geral)'),
('Desengajado (Geral)'),
('Primeiro Acesso (Geral)');

-- 3. Inserir FUNIS ESPECÍFICOS (2 tipos)
INSERT INTO public.funis_especificos (nome_funil) VALUES
('Engajado (Trilha)'),
('Desengajado (Trilha)');

-- 4. Inserir TEMPLATES MVP (9 templates: 3 globais + 6 específicos)
INSERT INTO public.templates (template_id_whatsapp, descricao, trilha_id, funil_global_id, funil_especifico_id, ativo) VALUES

-- ========== TEMPLATES GLOBAIS (3) ==========
('nunca_acessou_v1', 'Mensagem para quem comprou mas nunca acessou', NULL, 
    (SELECT id FROM public.funis_globais WHERE nome_funil = 'Nunca Acessou'), 
    NULL, true),

('desengajado_geral_v1', 'Mensagem para quem não acessa há mais de 30 dias', NULL, 
    (SELECT id FROM public.funis_globais WHERE nome_funil = 'Desengajado (Geral)'), 
    NULL, true),

('recompra_v1', 'Mensagem para quem concluiu mais de 60% e pode comprar próximo produto', NULL, 
    (SELECT id FROM public.funis_globais WHERE nome_funil = 'Recompra'), 
    NULL, true),

-- ========== TEMPLATES TRILHA 1 (2) ==========
('engajado_trilha_t1_v1', 'Mensagem de incentivo para quem está ativo na Trilha 1', 
    (SELECT id FROM public.trilhas WHERE ordem = 0), 
    NULL, 
    (SELECT id FROM public.funis_especificos WHERE nome_funil = 'Engajado (Trilha)'), 
    true),

('desengajado_trilha_t1_v1', 'Mensagem de reengajamento para quem está atrasado na Trilha 1', 
    (SELECT id FROM public.trilhas WHERE ordem = 0), 
    NULL, 
    (SELECT id FROM public.funis_especificos WHERE nome_funil = 'Desengajado (Trilha)'), 
    true),

-- ========== TEMPLATES TRILHA 2 (2) ==========
('engajado_trilha_t2_v1', 'Mensagem de incentivo para quem está ativo na Trilha 2', 
    (SELECT id FROM public.trilhas WHERE ordem = 1), 
    NULL, 
    (SELECT id FROM public.funis_especificos WHERE nome_funil = 'Engajado (Trilha)'), 
    true),

('desengajado_trilha_t2_v1', 'Mensagem de reengajamento para quem está atrasado na Trilha 2', 
    (SELECT id FROM public.trilhas WHERE ordem = 1), 
    NULL, 
    (SELECT id FROM public.funis_especificos WHERE nome_funil = 'Desengajado (Trilha)'), 
    true),

-- ========== TEMPLATES TRILHA 3 (2) ==========
('engajado_trilha_t3_v1', 'Mensagem de incentivo para quem está ativo na Trilha 3', 
    (SELECT id FROM public.trilhas WHERE ordem = 2), 
    NULL, 
    (SELECT id FROM public.funis_especificos WHERE nome_funil = 'Engajado (Trilha)'), 
    true),

('desengajado_trilha_t3_v1', 'Mensagem de reengajamento para quem está atrasado na Trilha 3', 
    (SELECT id FROM public.trilhas WHERE ordem = 2), 
    NULL, 
    (SELECT id FROM public.funis_especificos WHERE nome_funil = 'Desengajado (Trilha)'), 
    true);

COMMIT;
```

---

## Script 2: Validação Completa v2.1 ⭐

**📋 Propósito:** Validar TODO o banco (11 tabelas, colunas, constraints, índices, função, seed)  
**🎯 Use este script:** Antes de commit/push, para troubleshooting, para verificar conformidade 100%

```sql
-- =====================================================================
-- SCRIPT 2: VALIDAÇÃO COMPLETA DO BANCO DE DADOS v2.1
-- =====================================================================
-- Propósito: Validar se o banco está 100% conforme TABELAS.md
-- 
-- Verifica:
-- 1. Todas as 11 tabelas existem
-- 2. Todas as colunas de cada tabela existem com tipos corretos
-- 3. Todas as constraints (PK, FK, UNIQUE, CHECK)
-- 4. Todos os índices de performance
-- 5. Função buscar_dossie_cs() v2.1 existe
-- 6. Dados de seed (trilhas, funis, templates)
-- =====================================================================

-- PARTE 1: Verificar tabelas
WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'alunos', 'trilhas', 'progresso_alunos', 'templates', 'campanhas',
    'logs_envios', 'funis_globais', 'funis_especificos', 
    'snapshots_alunos_campanhas', 'conversas_chatwoot', 'mensagens_chatwoot'
  ]) AS table_name
),
existing_tables AS (
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
)
SELECT 
  '1. TABELAS' AS tipo,
  et.table_name AS detalhe,
  CASE WHEN ext.table_name IS NOT NULL THEN '✅ OK' ELSE '❌ ERRO' END AS status
FROM expected_tables et
LEFT JOIN existing_tables ext ON et.table_name = ext.table_name
ORDER BY et.table_name;

-- PARTE 2: Verificar Primary Keys
WITH expected_pks AS (
  SELECT unnest(ARRAY[
    'alunos', 'trilhas', 'progresso_alunos', 'templates', 'campanhas',
    'logs_envios', 'funis_globais', 'funis_especificos', 'snapshots_alunos_campanhas',
    'conversas_chatwoot', 'mensagens_chatwoot'
  ]) AS table_name
)
SELECT 
  '2. PRIMARY KEYS' AS tipo,
  ep.table_name AS detalhe,
  CASE 
    WHEN tc.constraint_name IS NOT NULL THEN '✅ OK'
    ELSE '❌ ERRO'
  END AS status
FROM expected_pks ep
LEFT JOIN information_schema.table_constraints tc 
  ON tc.table_name = ep.table_name AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY ep.table_name;

-- PARTE 3: Verificar Foreign Keys críticas
WITH expected_fks AS (
  SELECT 
    unnest(ARRAY[
      'conversas_chatwoot → alunos',
      'mensagens_chatwoot → conversas_chatwoot',
      'logs_envios → conversas_chatwoot',
      'snapshots_alunos_campanhas → campanhas',
      'snapshots_alunos_campanhas → alunos',
      'templates → funis_globais',
      'templates → funis_especificos'
    ]) AS fk_description,
    unnest(ARRAY[
      'conversas_chatwoot',
      'mensagens_chatwoot',
      'logs_envios',
      'snapshots_alunos_campanhas',
      'snapshots_alunos_campanhas',
      'templates',
      'templates'
    ]) AS table_name
)
SELECT 
  '3. FOREIGN KEYS' AS tipo,
  ef.fk_description AS detalhe,
  CASE 
    WHEN tc.constraint_name IS NOT NULL THEN '✅ OK'
    ELSE '❌ ERRO'
  END AS status
FROM expected_fks ef
LEFT JOIN information_schema.table_constraints tc 
  ON tc.table_name = ef.table_name AND tc.constraint_type = 'FOREIGN KEY'
GROUP BY ef.fk_description, ef.table_name, tc.constraint_name
ORDER BY ef.table_name;

-- PARTE 4: Verificar índices de performance
WITH expected_indexes AS (
  SELECT unnest(ARRAY[
    'idx_conversas_aluno',
    'idx_conversas_status',
    'idx_conversas_chatwoot_id',
    'idx_conversas_data_criacao',
    'idx_mensagens_conversa',
    'idx_mensagens_data',
    'idx_logs_conversa_chatwoot',
    'idx_alunos_email',
    'idx_templates_funil_global'
  ]) AS index_name
)
SELECT 
  '4. ÍNDICES' AS tipo,
  ei.index_name AS detalhe,
  CASE 
    WHEN pi.indexname IS NOT NULL THEN '✅ OK'
    ELSE '❌ ERRO'
  END AS status
FROM expected_indexes ei
LEFT JOIN pg_indexes pi ON pi.indexname = ei.index_name
ORDER BY ei.index_name;

-- PARTE 5: Verificar função buscar_dossie_cs()
SELECT 
  '5. FUNÇÃO SQL' AS tipo,
  'buscar_dossie_cs(p_aluno_id UUID)' AS detalhe,
  CASE 
    WHEN r.routine_name IS NOT NULL AND r.data_type = 'json' THEN '✅ OK'
    WHEN r.routine_name IS NOT NULL THEN '⚠️ TIPO INCORRETO'
    ELSE '❌ ERRO'
  END AS status
FROM information_schema.routines r
WHERE r.routine_name = 'buscar_dossie_cs' AND r.routine_type = 'FUNCTION';

-- PARTE 6: Verificar dados de seed
SELECT 
  '6. SEED DATA' AS tipo,
  'trilhas' AS detalhe,
  CASE WHEN COUNT(*) = 11 THEN '✅ OK' ELSE '❌ ERRO (' || COUNT(*) || ' encontradas)' END AS status
FROM trilhas
UNION ALL
SELECT 
  '6. SEED DATA' AS tipo,
  'funis_globais' AS detalhe,
  CASE WHEN COUNT(*) = 5 THEN '✅ OK' ELSE '❌ ERRO (' || COUNT(*) || ' encontrados)' END AS status
FROM funis_globais
UNION ALL
SELECT 
  '6. SEED DATA' AS tipo,
  'funis_especificos' AS detalhe,
  CASE WHEN COUNT(*) = 2 THEN '✅ OK' ELSE '❌ ERRO (' || COUNT(*) || ' encontrados)' END AS status
FROM funis_especificos
UNION ALL
SELECT 
  '6. SEED DATA' AS tipo,
  'templates (mínimo)' AS detalhe,
  CASE WHEN COUNT(*) >= 9 THEN '✅ OK' ELSE '❌ ERRO (' || COUNT(*) || ' encontrados)' END AS status
FROM templates;

-- PARTE 7: Verificar colunas críticas das novas tabelas
SELECT 
  '7. COLUNAS conversas_chatwoot' AS tipo,
  column_name AS detalhe,
  CASE 
    WHEN data_type IN ('uuid', 'text', 'character varying', 'timestamp with time zone') THEN '✅ OK'
    ELSE '⚠️ TIPO: ' || data_type
  END AS status
FROM information_schema.columns 
WHERE table_name = 'conversas_chatwoot'
  AND column_name IN (
    'id', 'aluno_id', 'conversation_id_chatwoot', 'status_conversa',
    'contexto_historico', 'resumo_evolutivo', 'resumo_final'
  )
ORDER BY column_name;

SELECT 
  '8. COLUNAS mensagens_chatwoot' AS tipo,
  column_name AS detalhe,
  CASE 
    WHEN data_type IN ('uuid', 'text', 'character varying', 'jsonb', 'timestamp with time zone') THEN '✅ OK'
    ELSE '⚠️ TIPO: ' || data_type
  END AS status
FROM information_schema.columns 
WHERE table_name = 'mensagens_chatwoot'
  AND column_name IN (
    'id', 'conversa_id', 'message_id_chatwoot', 'conteudo',
    'tipo_mensagem', 'remetente_tipo', 'anexos'
  )
ORDER BY column_name;

-- PARTE 8: Resumo final
SELECT 
  '📊 RESUMO FINAL' AS tipo,
  'Total de tabelas' AS detalhe,
  COUNT(*)::text || ' de 11' AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'alunos', 'trilhas', 'progresso_alunos', 'templates', 'campanhas',
    'logs_envios', 'funis_globais', 'funis_especificos', 
    'snapshots_alunos_campanhas', 'conversas_chatwoot', 'mensagens_chatwoot'
  );

SELECT 
  '✅ VALIDAÇÃO FINALIZADA!' AS mensagem,
  CASE 
    WHEN COUNT(*) = 11 THEN '🎉 Banco 100% conforme TABELAS.md v2.1'
    ELSE '⚠️ Revisar itens com status ERRO acima'
  END AS resultado
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'alunos', 'trilhas', 'progresso_alunos', 'templates', 'campanhas',
    'logs_envios', 'funis_globais', 'funis_especificos', 
    'snapshots_alunos_campanhas', 'conversas_chatwoot', 'mensagens_chatwoot'
  );
```

---

## Script 3: Debug Completo (Diagnóstico)

**📋 Propósito:** Mostra TODOS os dados de TODAS as tabelas + validações críticas  
**🎯 Use este script:** Para diagnóstico, troubleshooting, validação de dados de teste

```sql
-- =====================================================================
-- SCRIPT 3: DEBUG COMPLETO - TerceirizaCS
-- =====================================================================
-- Este script mostra TODOS os dados de TODAS as tabelas
-- Use para validar se o banco está populado corretamente
-- =====================================================================

-- ===================================================================
-- PARTE 1: CONTADORES (Visão Geral)
-- ===================================================================

SELECT 
  'RESUMO GERAL' AS tipo,
  (SELECT COUNT(*) FROM public.alunos) AS total_alunos,
  (SELECT COUNT(*) FROM public.trilhas) AS total_trilhas,
  (SELECT COUNT(*) FROM public.templates) AS total_templates,
  (SELECT COUNT(*) FROM public.funis_globais) AS total_funis_globais,
  (SELECT COUNT(*) FROM public.funis_especificos) AS total_funis_especificos,
  (SELECT COUNT(*) FROM public.progresso_alunos) AS total_progressos,
  (SELECT COUNT(*) FROM public.campanhas) AS total_campanhas,
  (SELECT COUNT(*) FROM public.logs_envios) AS total_logs,
  (SELECT COUNT(*) FROM public.snapshots_alunos_campanhas) AS total_snapshots,
  (SELECT COUNT(*) FROM public.conversas_chatwoot) AS total_conversas,
  (SELECT COUNT(*) FROM public.mensagens_chatwoot) AS total_mensagens;

-- ===================================================================
-- PARTE 2: TABELAS DE CONFIGURAÇÃO (Devem estar populadas)
-- ===================================================================

-- 2.1 - TRILHAS (deve ter 3)
SELECT 
  '=== TRILHAS ===' AS tabela,
  id,
  nome_trilha,
  ordem
FROM public.trilhas
ORDER BY ordem;

-- 2.2 - FUNIS GLOBAIS (deve ter 5)
SELECT 
  '=== FUNIS GLOBAIS ===' AS tabela,
  id,
  nome_funil
FROM public.funis_globais
ORDER BY id;

-- 2.3 - FUNIS ESPECÍFICOS (deve ter 2)
SELECT 
  '=== FUNIS ESPECÍFICOS ===' AS tabela,
  id,
  nome_funil
FROM public.funis_especificos
ORDER BY id;

-- 2.4 - TEMPLATES (deve ter 9+)
SELECT 
  '=== TEMPLATES ===' AS tabela,
  id,
  template_id_whatsapp,
  descricao,
  trilha_id,
  funil_global_id,
  funil_especifico_id,
  ativo,
  CASE 
    WHEN funil_global_id IS NOT NULL THEN 'GLOBAL'
    ELSE 'ESPECÍFICO'
  END AS tipo_template
FROM public.templates
ORDER BY 
  CASE WHEN funil_global_id IS NOT NULL THEN 0 ELSE 1 END,
  trilha_id,
  id;

-- ===================================================================
-- PARTE 3: CONVERSAS CHATWOOT (v2.0)
-- ===================================================================

-- 3.1 - Conversas (últimas 10)
SELECT 
  '=== CONVERSAS CHATWOOT (Amostra) ===' AS tabela,
  cc.id,
  a.apelido AS aluno,
  cc.conversation_id_chatwoot,
  cc.status_conversa,
  cc.agente_id_chatwoot,
  LENGTH(cc.contexto_historico) AS len_contexto,
  LENGTH(cc.resumo_evolutivo) AS len_resumo_evol,
  LENGTH(cc.resumo_final) AS len_resumo_final,
  cc.data_criacao,
  cc.data_ultima_interacao
FROM public.conversas_chatwoot cc
LEFT JOIN public.alunos a ON cc.aluno_id = a.id
ORDER BY cc.data_criacao DESC
LIMIT 10;

-- 3.2 - Mensagens (últimas 10)
SELECT 
  '=== MENSAGENS CHATWOOT (Amostra) ===' AS tabela,
  m.id,
  cc.conversation_id_chatwoot AS conversa,
  m.remetente_tipo,
  m.tipo_mensagem,
  LEFT(m.conteudo, 50) AS conteudo_preview,
  m.data_envio
FROM public.mensagens_chatwoot m
LEFT JOIN public.conversas_chatwoot cc ON m.conversa_id = cc.id
ORDER BY m.data_envio DESC
LIMIT 10;

-- ===================================================================
-- PARTE 4: VALIDAÇÕES CRÍTICAS
-- ===================================================================

-- 4.1 - Verifica se templates estão corretamente configurados
SELECT 
  '=== VALIDAÇÃO: Templates Globais ===' AS validacao,
  COUNT(*) AS quantidade_encontrada,
  3 AS quantidade_esperada,
  CASE WHEN COUNT(*) = 3 THEN '✓ OK' ELSE '✗ ERRO' END AS status
FROM public.templates
WHERE funil_global_id IS NOT NULL AND ativo = true;

-- 4.2 - Verifica templates específicos por trilha
SELECT 
  '=== VALIDAÇÃO: Templates por Trilha ===' AS validacao,
  t.nome_trilha,
  COUNT(tmp.id) AS templates_encontrados,
  2 AS templates_esperados,
  CASE WHEN COUNT(tmp.id) = 2 THEN '✓ OK' ELSE '✗ ERRO' END AS status
FROM public.trilhas t
LEFT JOIN public.templates tmp ON t.id = tmp.trilha_id AND tmp.ativo = true
GROUP BY t.id, t.nome_trilha
ORDER BY t.ordem;

-- 4.3 - Verifica se há alunos com celular (elegíveis para campanha)
SELECT 
  '=== VALIDAÇÃO: Alunos Elegíveis ===' AS validacao,
  COUNT(*) AS alunos_com_celular,
  COUNT(*) FILTER (WHERE data_primeiro_acesso IS NOT NULL) AS alunos_que_acessaram,
  COUNT(*) FILTER (WHERE data_primeiro_acesso IS NULL) AS alunos_nunca_acessaram
FROM public.alunos
WHERE celular IS NOT NULL AND celular != '';

-- 4.4 - Verifica conversas Chatwoot
SELECT 
  '=== VALIDAÇÃO: Conversas Chatwoot ===' AS validacao,
  COUNT(*) AS total_conversas,
  COUNT(*) FILTER (WHERE status_conversa = 'open') AS abertas,
  COUNT(*) FILTER (WHERE status_conversa = 'resolved') AS resolvidas,
  COUNT(*) FILTER (WHERE contexto_historico IS NOT NULL) AS com_contexto_historico
FROM public.conversas_chatwoot;

-- ===================================================================
-- PARTE 5: CHECKLIST FINAL
-- ===================================================================

SELECT 
  '=== CHECKLIST FINAL ===' AS tipo,
  
  -- Check 1: Trilhas
  CASE 
    WHEN (SELECT COUNT(*) FROM public.trilhas) = 3 THEN '✓' 
    ELSE '✗' 
  END AS trilhas_ok,
  
  -- Check 2: Funis Globais
  CASE 
    WHEN (SELECT COUNT(*) FROM public.funis_globais) = 5 THEN '✓' 
    ELSE '✗' 
  END AS funis_globais_ok,
  
  -- Check 3: Funis Específicos
  CASE 
    WHEN (SELECT COUNT(*) FROM public.funis_especificos) = 2 THEN '✓' 
    ELSE '✗' 
  END AS funis_especificos_ok,
  
  -- Check 4: Templates
  CASE 
    WHEN (SELECT COUNT(*) FROM public.templates WHERE ativo = true) >= 9 THEN '✓' 
    ELSE '✗' 
  END AS templates_ok,
  
  -- Check 5: Tabelas Chatwoot
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversas_chatwoot') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens_chatwoot') 
    THEN '✓' 
    ELSE '✗' 
  END AS chatwoot_ok;
```

---

## Script 4: Diagnóstico Completo do Banco (Comparação com Documentação) ⭐

**📋 Propósito:** Extrair TODA a estrutura do banco (CREATE TABLE real) para comparar com este documento  
**🎯 Use este script:** Para verificar se o banco Supabase está 100% igual à documentação  
**💡 Dica:** Compare o output deste script com as definições das Tabelas 1-11 acima

```sql
-- =====================================================================
-- SCRIPT 4: DIAGNÓSTICO COMPLETO DO BANCO SUPABASE
-- =====================================================================
-- Propósito: Extrair TODA a estrutura real do banco para comparação
-- 
-- Retorna:
-- 1. CREATE TABLE completo de CADA tabela (estrutura exata)
-- 2. Todas as constraints (PK, FK, UNIQUE, CHECK)
-- 3. Todos os índices
-- 4. Todas as funções/triggers
-- 5. Comentários nas tabelas/colunas
-- =====================================================================

-- ===================================================================
-- PARTE 1: LISTA DE TODAS AS TABELAS
-- ===================================================================
SELECT 
  '📋 PARTE 1: TABELAS EXISTENTES' AS secao,
  table_name AS nome_tabela,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS total_colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ===================================================================
-- PARTE 2: DEFINIÇÃO COMPLETA DE CADA TABELA (CREATE TABLE)
-- ===================================================================

-- Para cada tabela, mostra:
-- - Nome da coluna
-- - Tipo de dados
-- - Se aceita NULL
-- - Valor padrão
-- - Se é chave primária

SELECT 
  '📋 PARTE 2: ESTRUTURA DETALHADA' AS secao,
  t.table_name AS tabela,
  c.column_name AS coluna,
  c.data_type AS tipo,
  CASE WHEN c.character_maximum_length IS NOT NULL 
       THEN c.data_type || '(' || c.character_maximum_length || ')'
       ELSE c.data_type 
  END AS tipo_completo,
  c.is_nullable AS aceita_null,
  c.column_default AS valor_padrao,
  CASE WHEN pk.column_name IS NOT NULL THEN 'SIM' ELSE 'NÃO' END AS eh_pk
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
  SELECT 
    kcu.table_name,
    kcu.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- ===================================================================
-- PARTE 3: TODAS AS CONSTRAINTS (PK, FK, UNIQUE, CHECK)
-- ===================================================================

-- 3.1 - PRIMARY KEYS
SELECT 
  '🔑 PARTE 3.1: PRIMARY KEYS' AS secao,
  tc.table_name AS tabela,
  tc.constraint_name AS nome_constraint,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS colunas_pk
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- 3.2 - FOREIGN KEYS
SELECT 
  '🔗 PARTE 3.2: FOREIGN KEYS' AS secao,
  tc.table_name AS tabela_origem,
  kcu.column_name AS coluna_origem,
  ccu.table_name AS tabela_destino,
  ccu.column_name AS coluna_destino,
  tc.constraint_name AS nome_constraint,
  rc.delete_rule AS on_delete,
  rc.update_rule AS on_update
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 3.3 - UNIQUE CONSTRAINTS
SELECT 
  '✨ PARTE 3.3: UNIQUE CONSTRAINTS' AS secao,
  tc.table_name AS tabela,
  tc.constraint_name AS nome_constraint,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS colunas_unique
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- 3.4 - CHECK CONSTRAINTS
SELECT 
  '✅ PARTE 3.4: CHECK CONSTRAINTS' AS secao,
  tc.table_name AS tabela,
  tc.constraint_name AS nome_constraint,
  cc.check_clause AS definicao
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ===================================================================
-- PARTE 4: TODOS OS ÍNDICES
-- ===================================================================

SELECT 
  '📊 PARTE 4: ÍNDICES' AS secao,
  tablename AS tabela,
  indexname AS nome_indice,
  indexdef AS definicao_completa
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  )
ORDER BY tablename, indexname;

-- ===================================================================
-- PARTE 5: TODAS AS FUNÇÕES SQL
-- ===================================================================

SELECT 
  '⚙️ PARTE 5: FUNÇÕES SQL' AS secao,
  routine_name AS nome_funcao,
  routine_type AS tipo,
  data_type AS tipo_retorno,
  routine_definition AS definicao_completa
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ===================================================================
-- PARTE 6: TODOS OS TRIGGERS
-- ===================================================================

SELECT 
  '🔔 PARTE 6: TRIGGERS' AS secao,
  trigger_name AS nome_trigger,
  event_object_table AS tabela,
  action_timing AS timing,
  event_manipulation AS evento,
  action_statement AS acao
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ===================================================================
-- PARTE 7: COMENTÁRIOS NAS TABELAS E COLUNAS
-- ===================================================================

-- 7.1 - Comentários nas tabelas
SELECT 
  '💬 PARTE 7.1: COMENTÁRIOS NAS TABELAS' AS secao,
  c.relname AS tabela,
  d.description AS comentario
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_description d ON d.objoid = c.oid AND d.objsubid = 0
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
  AND d.description IS NOT NULL
ORDER BY c.relname;

-- 7.2 - Comentários nas colunas
SELECT 
  '💬 PARTE 7.2: COMENTÁRIOS NAS COLUNAS' AS secao,
  c.relname AS tabela,
  a.attname AS coluna,
  d.description AS comentario
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = c.oid
LEFT JOIN pg_description d ON d.objoid = c.oid AND d.objsubid = a.attnum
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
  AND a.attnum > 0
  AND NOT a.attisdropped
  AND d.description IS NOT NULL
ORDER BY c.relname, a.attnum;

-- ===================================================================
-- PARTE 8: RESUMO EXECUTIVO (COMPARAÇÃO COM DOCUMENTAÇÃO)
-- ===================================================================

WITH doc_expected AS (
  -- O que DEVERIA ter segundo este documento
  SELECT 
    unnest(ARRAY[
      'alunos', 'trilhas', 'progresso_alunos', 'templates', 'campanhas',
      'logs_envios', 'funis_globais', 'funis_especificos', 
      'snapshots_alunos_campanhas', 'conversas_chatwoot', 'mensagens_chatwoot'
    ]) AS table_name,
    unnest(ARRAY[10, 3, 4, 7, 7, 10, 2, 2, 7, 14, 9]) AS expected_columns
),
db_actual AS (
  -- O que REALMENTE tem no banco
  SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS actual_columns
  FROM information_schema.tables t
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
)
SELECT 
  '📊 PARTE 8: RESUMO EXECUTIVO' AS secao,
  de.table_name AS tabela_esperada,
  de.expected_columns AS colunas_doc,
  COALESCE(da.actual_columns, 0) AS colunas_banco,
  CASE 
    WHEN da.table_name IS NULL THEN '❌ TABELA NÃO EXISTE'
    WHEN de.expected_columns = da.actual_columns THEN '✅ OK'
    WHEN de.expected_columns < da.actual_columns THEN '⚠️ BANCO TEM MAIS COLUNAS'
    ELSE '❌ BANCO TEM MENOS COLUNAS'
  END AS status
FROM doc_expected de
LEFT JOIN db_actual da ON de.table_name = da.table_name
ORDER BY de.table_name;

-- ===================================================================
-- PARTE 9: CONTADORES FINAIS
-- ===================================================================

SELECT 
  '📈 PARTE 9: CONTADORES FINAIS' AS secao,
  'Tabelas no banco' AS item,
  COUNT(*)::text AS quantidade
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
  '📈 PARTE 9: CONTADORES FINAIS' AS secao,
  'Constraints (PK+FK+UNIQUE+CHECK)' AS item,
  COUNT(*)::text AS quantidade
FROM information_schema.table_constraints
WHERE table_schema = 'public'

UNION ALL

SELECT 
  '📈 PARTE 9: CONTADORES FINAIS' AS secao,
  'Índices criados' AS item,
  COUNT(*)::text AS quantidade
FROM pg_indexes
WHERE schemaname = 'public'

UNION ALL

SELECT 
  '📈 PARTE 9: CONTADORES FINAIS' AS secao,
  'Funções SQL' AS item,
  COUNT(*)::text AS quantidade
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'

UNION ALL

SELECT 
  '📈 PARTE 9: CONTADORES FINAIS' AS secao,
  'Triggers' AS item,
  COUNT(*)::text AS quantidade
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- ===================================================================
-- MENSAGEM FINAL
-- ===================================================================

SELECT 
  '✅ DIAGNÓSTICO COMPLETO FINALIZADO!' AS mensagem,
  '📋 Compare cada PARTE com a documentação acima' AS instrucao,
  'Se PARTE 8 mostrar todos ✅ OK, então banco = doc' AS criterio_sucesso;
```

**📋 Como usar este script:**

1. **Cole no Supabase SQL Editor**
2. **Clique em "Run"** (ou Ctrl/Cmd + Enter)
3. **Analise os resultados:**
   - **PARTE 1:** Lista todas as tabelas (deve ter 11)
   - **PARTE 2:** Estrutura completa de cada tabela (compare com Tabelas 1-11 acima)
   - **PARTE 3:** Todas as constraints (PK, FK, UNIQUE, CHECK)
   - **PARTE 4:** Todos os índices (deve ter 9+)
   - **PARTE 5:** Função `buscar_dossie_cs()` (deve ter definição completa)
   - **PARTE 6:** Triggers (pode estar vazio se não houver)
   - **PARTE 7:** Comentários (deve ter vários)
   - **PARTE 8:** **RESUMO EXECUTIVO** - mostra diferenças entre doc e banco ⭐
   - **PARTE 9:** Contadores gerais

4. **PARTE 8 é a mais importante:**
   - ✅ **OK** = Tabela tem quantidade correta de colunas
   - ⚠️ **BANCO TEM MAIS COLUNAS** = Pode ter colunas extras (RLS, audit, etc.)
   - ❌ **TABELA NÃO EXISTE** = Tabela documentada mas não criada
   - ❌ **BANCO TEM MENOS COLUNAS** = Tabela incompleta

**🎯 Critério de sucesso:**
- PARTE 8 deve mostrar todas as 11 tabelas com status ✅ OK ou ⚠️ (pode ter colunas extras do Supabase)
- PARTE 5 deve mostrar função `buscar_dossie_cs`
- PARTE 4 deve mostrar pelo menos 9 índices

---

## 📚 REFERÊNCIAS

- **PLANO_CHATWOOT_INTEGRATION.md** - Roadmap completo da integração
- **MAPA_DE_DEPENDENCIAS.md** - Como tabelas se relacionam com workflows
- **LOGICA_DE_FUNIS.md** - Regras de classificação usadas em `buscar_dossie_cs()`
- **README.md** - Visão geral do projeto

---

**Documento atualizado para v2.1 em:** 18 de Outubro de 2025  
**Status:** ✅ Banco de dados em produção  
**Próxima ação:** Implementar Fase 2 Chatwoot (Workflow Central)
