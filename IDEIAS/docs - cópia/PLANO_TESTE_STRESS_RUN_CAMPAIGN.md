# Plano de Teste de Stress - [CS] Run_Campaign

**Versão:** 1.0  
**Data de Criação:** 04 de Novembro de 2025  
**Objetivo:** Testar TODAS as 23 possibilidades de classificação de funis e envio de mensagens  
**Duração Estimada:** 4-6 horas (simulação completa)

---

## 📋 DADOS DO ALUNO DE TESTE

### **Perfil Base**

```
ID Externo (Cademi): 28557630
Nome: Tiago Gladstone
Email: tiagogladstone@gmail.com
Celular: 5538997285758
Login Auto: https://membros.academiadosleiloes.com/auth/login?crstk=MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy
Data Primeiro Acesso: (variável conforme cenário)
Data Último Acesso: (variável conforme cenário)
```

### **SQL para Inserir Aluno no Banco**

```sql
-- LIMPAR dados de testes anteriores (se existir)
DELETE FROM public.progresso_alunos WHERE aluno_id IN (
  SELECT id FROM public.alunos WHERE id_externo = 28557630
);
DELETE FROM public.alunos WHERE id_externo = 28557630;

-- INSERIR aluno de teste
INSERT INTO public.alunos (
  id_externo,
  nome_completo,
  apelido,
  email,
  celular,
  ativo,
  data_primeiro_acesso,
  data_ultimo_acesso
) VALUES (
  28557630,
  'Tiago Gladstone',
  'Tiago',
  'tiagogladstone@gmail.com',
  '5538997285758',
  true,
  NULL, -- Será ajustado conforme cenário
  NULL  -- Será ajustado conforme cenário
)
RETURNING id;

-- Guarde o UUID retornado para usar nos próximos comandos
-- Exemplo: '12345678-1234-1234-1234-123456789abc'
```

---

## 🎯 MATRIZ DE TESTES - 23 CENÁRIOS

### **LEGENDA:**
- **FG** = Funil Global (1-5)
- **FT** = Funil Trilha (1-2 ou NULL)
- **PG** = Prioridade Global (true/false)
- **Template** = ID do template esperado

---

## **GRUPO A: FUNIS GLOBAIS URGENTES (3 cenários)**

### **A1 - Nunca Acessou (FG=1, FT=NULL, PG=true)**

**Condições:**
- `data_primeiro_acesso IS NULL`
- Não importa `media_geral` nem `data_ultimo_acesso`

**Setup SQL:**
```sql
UPDATE public.alunos 
SET 
  data_primeiro_acesso = NULL,
  data_ultimo_acesso = NULL
WHERE id_externo = 28557630;

-- Limpar todo progresso
DELETE FROM public.progresso_alunos 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);
```

**Disparo de Campanha:**
- Marcar checkbox para QUALQUER trilha (ex: Boas Vindas)
- Run_Campaign deve classificar como FG=1

**Resultado Esperado:**
- Snapshot: `funil_global_id=1`, `funil_trilha_id=NULL`, `prioridade_global=true`
- Template usado: ID 11 (descricao: "Mensagem para quem comprou mas nunca acessou")
- Mensagem enviada: "Oi *Tiago* ,tudo bem com você???"

---

### **A2 - Recompra (FG=2, FT=NULL, PG=true)**

**Condições:**
- `media_geral > 60%`
- Não importa se ativo ou inativo

**Setup SQL:**
```sql
-- Garantir que primeiro acesso existe
UPDATE public.alunos 
SET 
  data_primeiro_acesso = NOW() - INTERVAL '60 days',
  data_ultimo_acesso = NOW() - INTERVAL '10 days'
WHERE id_externo = 28557630;

-- Simular 100% em 7 trilhas (das 11 totais = 63.6%)
DELETE FROM public.progresso_alunos 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

INSERT INTO public.progresso_alunos (aluno_id, trilha_id, percentual_progresso, data_atualizacao)
SELECT 
  (SELECT id FROM public.alunos WHERE id_externo = 28557630),
  id,
  100,
  NOW()
FROM public.trilhas
WHERE ordem <= 7;
```

**Disparo de Campanha:**
- Marcar checkbox para QUALQUER trilha
- Run_Campaign deve calcular `media_geral = 63.6%` e classificar como FG=2

**Resultado Esperado:**
- Snapshot: `funil_global_id=2`, `funil_trilha_id=NULL`, `prioridade_global=true`
- Template usado: ID 13 (descricao: "Mensagem para quem concluiu mais de 60%...")
- Mensagem enviada: "Oi *Tiago* ,tudo bem com você???"

---

### **A3 - Desengajado Geral (FG=4, FT=NULL, PG=true)**

**Condições:**
- `data_ultimo_acesso < (NOW() - 30 dias)`
- `media_geral` entre 1% e 60%

**Setup SQL:**
```sql
-- Último acesso há 45 dias
UPDATE public.alunos 
SET 
  data_primeiro_acesso = NOW() - INTERVAL '90 days',
  data_ultimo_acesso = NOW() - INTERVAL '45 days'
WHERE id_externo = 28557630;

-- Simular 50% em 2 trilhas (das 11 = 9% média geral)
DELETE FROM public.progresso_alunos 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

INSERT INTO public.progresso_alunos (aluno_id, trilha_id, percentual_progresso, data_atualizacao)
SELECT 
  (SELECT id FROM public.alunos WHERE id_externo = 28557630),
  id,
  50,
  NOW() - INTERVAL '45 days'
FROM public.trilhas
WHERE ordem <= 2;
```

**Disparo de Campanha:**
- Marcar checkbox para QUALQUER trilha
- Run_Campaign deve calcular `media_geral = 9%` e detectar inatividade (45 dias)

**Resultado Esperado:**
- Snapshot: `funil_global_id=4`, `funil_trilha_id=NULL`, `prioridade_global=true`
- Template usado: ID 12 (descricao: "Mensagem para quem não acessa há mais de 30 dias")
- Mensagem enviada: "Oi *Tiago* ,tudo bem com você???"

---

## **GRUPO B: ENGAJADO GERAL (10 cenários - 1 por trilha)**

**Condições Gerais:**
- `data_ultimo_acesso >= (NOW() - 30 dias)` ✅ ATIVO
- `media_geral` entre 21% e 60%
- `media_semana_atual > 50%` → FT=1 (Engajado)

### **B1 - Engajado Geral + Engajado Trilha "Boas Vindas"**

**Setup SQL:**
```sql
-- Ativo (último acesso há 5 dias)
UPDATE public.alunos 
SET 
  data_primeiro_acesso = NOW() - INTERVAL '30 days',
  data_ultimo_acesso = NOW() - INTERVAL '5 days'
WHERE id_externo = 28557630;

-- Simular 100% na trilha 1 (ordem=1) = media_geral=9% (100/11)
-- media_semana_atual = 100% (pois trilha foco é ordem 1)
DELETE FROM public.progresso_alunos 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

INSERT INTO public.progresso_alunos (aluno_id, trilha_id, percentual_progresso, data_atualizacao)
VALUES (
  (SELECT id FROM public.alunos WHERE id_externo = 28557630),
  '7abf1f64-ee41-476e-8604-0414b21aa1fa', -- Boas Vindas
  100,
  NOW() - INTERVAL '5 days'
);
```

**⚠️ PROBLEMA:** media_geral = 9% (< 21%) → Classificará como **Primeiro Acesso** (FG=5), não Engajado!

**Solução - Ajustar Setup:**
```sql
-- Adicionar progresso em mais trilhas para atingir media_geral entre 21-60%
-- Exemplo: 50% em 5 trilhas = (50*5)/11 = 22.7%
DELETE FROM public.progresso_alunos 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

INSERT INTO public.progresso_alunos (aluno_id, trilha_id, percentual_progresso, data_atualizacao)
SELECT 
  (SELECT id FROM public.alunos WHERE id_externo = 28557630),
  id,
  50,
  NOW() - INTERVAL '5 days'
FROM public.trilhas
WHERE ordem <= 5;

-- Aumentar trilha foco (Boas Vindas) para 100%
UPDATE public.progresso_alunos
SET percentual_progresso = 100
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630)
  AND trilha_id = '7abf1f64-ee41-476e-8604-0414b21aa1fa';
```

**Disparo de Campanha:**
- Marcar checkbox para trilha "Boas Vindas"

**Resultado Esperado:**
- Snapshot: `funil_global_id=3`, `funil_trilha_id=1`, `prioridade_global=false`
- Template usado: ID 20 (descricao: "Mensagem para quem está Engajado na trilha Boas Vindas")
- Mensagem enviada: "Oi *Tiago* ,tudo bem com você???"

---

### **B2 - Engajado Geral + Desengajado Trilha "Boas Vindas"**

**Setup SQL:**
```sql
-- Ativo (último acesso há 5 dias)
UPDATE public.alunos 
SET 
  data_primeiro_acesso = NOW() - INTERVAL '30 days',
  data_ultimo_acesso = NOW() - INTERVAL '5 days'
WHERE id_externo = 28557630;

-- Simular 50% nas trilhas 2-5 (media_geral=18%)
-- Trilha 1 (Boas Vindas) com apenas 20% (media_semana_atual=20% < 50%)
DELETE FROM public.progresso_alunos 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

INSERT INTO public.progresso_alunos (aluno_id, trilha_id, percentual_progresso, data_atualizacao)
SELECT 
  (SELECT id FROM public.alunos WHERE id_externo = 28557630),
  id,
  50,
  NOW() - INTERVAL '5 days'
FROM public.trilhas
WHERE ordem BETWEEN 2 AND 5;

-- Trilha foco com progresso baixo (desengajado)
INSERT INTO public.progresso_alunos (aluno_id, trilha_id, percentual_progresso, data_atualizacao)
VALUES (
  (SELECT id FROM public.alunos WHERE id_externo = 28557630),
  '7abf1f64-ee41-476e-8604-0414b21aa1fa', -- Boas Vindas
  20,
  NOW() - INTERVAL '5 days'
);
```

**⚠️ PROBLEMA:** media_geral = 20% (< 21%) → Classificará como **Primeiro Acesso** (FG=5), não Engajado!

**Solução - Ajustar Setup:**
```sql
-- Aumentar progresso geral para atingir 21-60%
UPDATE public.progresso_alunos
SET percentual_progresso = 60
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630)
  AND trilha_id IN (SELECT id FROM public.trilhas WHERE ordem BETWEEN 2 AND 5);

-- media_geral = (20 + 60*4)/11 = 23.6% ✅
-- media_semana_atual = 20% (desengajado na trilha 1)
```

**Disparo de Campanha:**
- Marcar checkbox para trilha "Boas Vindas"

**Resultado Esperado:**
- Snapshot: `funil_global_id=3`, `funil_trilha_id=2`, `prioridade_global=false`
- Template usado: ID 21 (descricao: "Mensagem para quem está Desengajado na trilha Boas Vindas")
- Mensagem enviada: "Oi *Tiago* ,tudo bem com você???"

---

### **B3 a B10 - Mesma Lógica para Trilhas 2-10**

**Padrão de Setup para cada trilha:**

```sql
-- TEMPLATE GENÉRICO (ajustar trilha_foco_id e ordem)

-- 1. Atualizar datas (sempre ativo)
UPDATE public.alunos 
SET 
  data_primeiro_acesso = NOW() - INTERVAL '30 days',
  data_ultimo_acesso = NOW() - INTERVAL '5 days'
WHERE id_externo = 28557630;

-- 2. Limpar progresso
DELETE FROM public.progresso_alunos 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

-- 3. Para ENGAJADO na trilha X (ordem N):
--    - Inserir 60% nas trilhas até ordem N
--    - media_semana_atual = 60% (>50% = Engajado)
--    - media_geral = (60*N)/11
INSERT INTO public.progresso_alunos (aluno_id, trilha_id, percentual_progresso, data_atualizacao)
SELECT 
  (SELECT id FROM public.alunos WHERE id_externo = 28557630),
  id,
  60,
  NOW() - INTERVAL '5 days'
FROM public.trilhas
WHERE ordem <= [N]; -- Substituir [N] pela ordem da trilha foco

-- 4. Para DESENGAJADO na trilha X (ordem N):
--    - Inserir 20% na trilha foco
--    - Inserir 60% nas demais (ordem < N)
--    - media_semana_atual = AVG(20, 60...) = depende da trilha
DELETE FROM public.progresso_alunos 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

INSERT INTO public.progresso_alunos (aluno_id, trilha_id, percentual_progresso, data_atualizacao)
SELECT 
  (SELECT id FROM public.alunos WHERE id_externo = 28557630),
  id,
  60,
  NOW() - INTERVAL '5 days'
FROM public.trilhas
WHERE ordem < [N];

INSERT INTO public.progresso_alunos (aluno_id, trilha_id, percentual_progresso, data_atualizacao)
VALUES (
  (SELECT id FROM public.alunos WHERE id_externo = 28557630),
  '[TRILHA_FOCO_ID]', -- UUID da trilha
  20,
  NOW() - INTERVAL '5 days'
);
```

**Tabela de Templates Esperados:**

| Cenário | Trilha | Ordem | FG | FT | Template ID | Descrição |
|---------|--------|-------|----|----|-------------|-----------|
| B3 | Missão 01 | 2 | 3 | 1 | 22 | Engajado Missão 01 |
| B4 | Missão 01 | 2 | 3 | 2 | 23 | Desengajado Missão 01 |
| B5 | Missão 02 | 3 | 3 | 1 | 24 | Engajado Missão 02 |
| B6 | Missão 02 | 3 | 3 | 2 | 25 | Desengajado Missão 02 |
| B7 | Missão 03 | 4 | 3 | 1 | 26 | Engajado Missão 03 |
| B8 | Missão 03 | 4 | 3 | 2 | 27 | Desengajado Missão 03 |
| B9 | Missão 04 | 5 | 3 | 1 | 28 | Engajado Missão 04 |
| B10 | Missão 04 | 5 | 3 | 2 | 29 | Desengajado Missão 04 |
| B11 | Missão 05 | 6 | 3 | 1 | 30 | Engajado Missão 05 |
| B12 | Missão 05 | 6 | 3 | 2 | 31 | Desengajado Missão 05 |
| B13 | Missão 06 | 7 | 3 | 1 | 32 | Engajado Missão 06 |
| B14 | Missão 06 | 7 | 3 | 2 | 33 | Desengajado Missão 06 |
| B15 | Missão 07 | 8 | 3 | 1 | 34 | Engajado Missão 07 |
| B16 | Missão 07 | 8 | 3 | 2 | 35 | Desengajado Missão 07 |
| B17 | Missão 08 | 9 | 3 | 1 | 36 | Engajado Missão 08 |
| B18 | Missão 08 | 9 | 3 | 2 | 37 | Desengajado Missão 08 |
| B19 | Missão 09 | 10 | 3 | 1 | 38 | Engajado Missão 09 |
| B20 | Missão 09 | 10 | 3 | 2 | 39 | Desengajado Missão 09 |
| B21 | Missão 10 | 11 | 3 | 1 | 40 | Engajado Missão 10 |
| B22 | Missão 10 | 11 | 3 | 2 | 41 | Desengajado Missão 10 |

---

## **GRUPO C: PRIMEIRO ACESSO (2 cenários)**

**Condições Gerais:**
- `data_ultimo_acesso >= (NOW() - 30 dias)` ✅ ATIVO
- `media_geral` entre 1% e 20%

### **C1 - Primeiro Acesso + Engajado Trilha**

**Setup SQL:**
```sql
UPDATE public.alunos 
SET 
  data_primeiro_acesso = NOW() - INTERVAL '7 days',
  data_ultimo_acesso = NOW() - INTERVAL '2 days'
WHERE id_externo = 28557630;

-- Simular 100% apenas na trilha 1 (Boas Vindas)
-- media_geral = 100/11 = 9% (dentro de 1-20%)
-- media_semana_atual = 100% (>50% = Engajado)
DELETE FROM public.progresso_alunos 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

INSERT INTO public.progresso_alunos (aluno_id, trilha_id, percentual_progresso, data_atualizacao)
VALUES (
  (SELECT id FROM public.alunos WHERE id_externo = 28557630),
  '7abf1f64-ee41-476e-8604-0414b21aa1fa', -- Boas Vindas
  100,
  NOW() - INTERVAL '2 days'
);
```

**Disparo de Campanha:**
- Marcar checkbox para trilha "Boas Vindas"

**Resultado Esperado:**
- Snapshot: `funil_global_id=5`, `funil_trilha_id=1`, `prioridade_global=false`
- Template usado: ID 20 (descricao: "Mensagem para quem está Engajado na trilha Boas Vindas")
- Mensagem enviada: "Oi *Tiago* ,tudo bem com você???"

---

### **C2 - Primeiro Acesso + Desengajado Trilha**

**Setup SQL:**
```sql
UPDATE public.alunos 
SET 
  data_primeiro_acesso = NOW() - INTERVAL '7 days',
  data_ultimo_acesso = NOW() - INTERVAL '2 days'
WHERE id_externo = 28557630;

-- Simular 20% na trilha 1 (Boas Vindas)
-- media_geral = 20/11 = 1.8% (dentro de 1-20%)
-- media_semana_atual = 20% (<50% = Desengajado)
DELETE FROM public.progresso_alunos 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

INSERT INTO public.progresso_alunos (aluno_id, trilha_id, percentual_progresso, data_atualizacao)
VALUES (
  (SELECT id FROM public.alunos WHERE id_externo = 28557630),
  '7abf1f64-ee41-476e-8604-0414b21aa1fa', -- Boas Vindas
  20,
  NOW() - INTERVAL '2 days'
);
```

**Disparo de Campanha:**
- Marcar checkbox para trilha "Boas Vindas"

**Resultado Esperado:**
- Snapshot: `funil_global_id=5`, `funil_trilha_id=2`, `prioridade_global=false`
- Template usado: ID 21 (descricao: "Mensagem para quem está Desengajado na trilha Boas Vindas")
- Mensagem enviada: "Oi *Tiago* ,tudo bem com você???"

---

## 🚀 SIMULAÇÃO DE WEBHOOKS (POSTMAN)

### **Configuração do Postman**

**URL do Webhook:**
```
POST https://wbhooks.tcsbrunolucarelli.uk/webhook/cademi-progresso
```

**Headers:**
```
Content-Type: application/json
User-Agent: cademi
```

---

### **WEBHOOK 1: Criar Aluno Novo (Nunca Acessou)**

**Body JSON:**
```json
{
  "event_id": "test-001-nunca-acessou",
  "event_type": "usuario.criado",
  "event": {
    "usuario": {
      "id": 28557630,
      "nome": "Tiago Gladstone",
      "email": "tiagogladstone@gmail.com",
      "doc": null,
      "celular": "+5538997285758",
      "login_auto": "https://membros.academiadosleiloes.com/auth/login?crstk=MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "login_crstk": "MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "gratis": false,
      "pontos": 0,
      "criado_em": "2025-11-04T09:09:21-03:00",
      "ultimo_acesso_em": null
    }
  }
}
```

**Resultado Esperado:**
- Novo registro em `alunos` com `data_primeiro_acesso = NULL`
- Pronto para teste A1 (Nunca Acessou)

---

### **WEBHOOK 2: Primeiro Acesso na Boas Vindas (0%)**

**Body JSON:**
```json
{
  "event_id": "test-002-primeiro-acesso",
  "event_type": "usuario.progresso",
  "event": {
    "usuario": {
      "id": 28557630,
      "nome": "Tiago Gladstone",
      "email": "tiagogladstone@gmail.com",
      "doc": null,
      "celular": "+5538997285758",
      "login_auto": "https://membros.academiadosleiloes.com/auth/login?crstk=MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "login_crstk": "MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "gratis": false,
      "pontos": 10,
      "criado_em": "2025-11-04T09:09:21-03:00",
      "ultimo_acesso_em": "2025-11-04T12:30:00-03:00"
    },
    "produto": {
      "id": 215609,
      "ordem": 1,
      "nome": "Boas Vindas",
      "oferta_url": null,
      "vitrine": {
        "id": 60122,
        "ordem": 1,
        "nome": "Plano do Arrematador"
      }
    },
    "progresso": 0
  }
}
```

**Resultado Esperado:**
- `data_primeiro_acesso` preenchido automaticamente
- `data_ultimo_acesso` atualizado
- Registro em `progresso_alunos` com 0%

---

### **WEBHOOK 3: Progresso 50% na Boas Vindas**

**Body JSON:**
```json
{
  "event_id": "test-003-progresso-50",
  "event_type": "usuario.progresso",
  "event": {
    "usuario": {
      "id": 28557630,
      "nome": "Tiago Gladstone",
      "email": "tiagogladstone@gmail.com",
      "doc": null,
      "celular": "+5538997285758",
      "login_auto": "https://membros.academiadosleiloes.com/auth/login?crstk=MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "login_crstk": "MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "gratis": false,
      "pontos": 50,
      "criado_em": "2025-11-04T09:09:21-03:00",
      "ultimo_acesso_em": "2025-11-04T14:15:00-03:00"
    },
    "produto": {
      "id": 215609,
      "ordem": 1,
      "nome": "Boas Vindas",
      "oferta_url": null,
      "vitrine": {
        "id": 60122,
        "ordem": 1,
        "nome": "Plano do Arrematador"
      }
    },
    "progresso": 50
  }
}
```

**Resultado Esperado:**
- `progresso_alunos.percentual_progresso` atualizado para 50
- `data_ultimo_acesso` atualizado
- Aluno ainda em Primeiro Acesso (media_geral = 50/11 = 4.5%)

---

### **WEBHOOK 4: Completar 100% Boas Vindas**

**Body JSON:**
```json
{
  "event_id": "test-004-completo-boas-vindas",
  "event_type": "usuario.progresso",
  "event": {
    "usuario": {
      "id": 28557630,
      "nome": "Tiago Gladstone",
      "email": "tiagogladstone@gmail.com",
      "doc": null,
      "celular": "+5538997285758",
      "login_auto": "https://membros.academiadosleiloes.com/auth/login?crstk=MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "login_crstk": "MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "gratis": false,
      "pontos": 100,
      "criado_em": "2025-11-04T09:09:21-03:00",
      "ultimo_acesso_em": "2025-11-04T16:45:00-03:00"
    },
    "produto": {
      "id": 215609,
      "ordem": 1,
      "nome": "Boas Vindas",
      "oferta_url": null,
      "vitrine": {
        "id": 60122,
        "ordem": 1,
        "nome": "Plano do Arrematador"
      }
    },
    "progresso": 100
  }
}
```

**Resultado Esperado:**
- `progresso_alunos.percentual_progresso` = 100
- media_geral = 9% (ainda Primeiro Acesso)
- media_semana_atual = 100% (Engajado na trilha)

**Disparo de Campanha:**
- Marcar checkbox para "Boas Vindas"
- Deve classificar como FG=5, FT=1 (Primeiro Acesso + Engajado)

---

### **WEBHOOK 5: Progresso em Missão 01 (Subir média geral)**

**Body JSON:**
```json
{
  "event_id": "test-005-missao-01-50",
  "event_type": "usuario.progresso",
  "event": {
    "usuario": {
      "id": 28557630,
      "nome": "Tiago Gladstone",
      "email": "tiagogladstone@gmail.com",
      "doc": null,
      "celular": "+5538997285758",
      "login_auto": "https://membros.academiadosleiloes.com/auth/login?crstk=MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "login_crstk": "MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "gratis": false,
      "pontos": 150,
      "criado_em": "2025-11-04T09:09:21-03:00",
      "ultimo_acesso_em": "2025-11-04T18:20:00-03:00"
    },
    "produto": {
      "id": 215444,
      "ordem": 2,
      "nome": "Missão 01 - Domine as Regras do Jogo",
      "oferta_url": null,
      "vitrine": {
        "id": 60122,
        "ordem": 2,
        "nome": "Plano do Arrematador"
      }
    },
    "progresso": 50
  }
}
```

**Resultado Esperado:**
- Novo registro em `progresso_alunos` para Missão 01 com 50%
- media_geral = (100 + 50)/11 = 13.6% (ainda Primeiro Acesso)
- Se disparar campanha para Missão 01:
  - media_semana_atual = (100 + 50)/2 = 75% (Engajado)
  - Classificação: FG=5, FT=1

---

### **WEBHOOK 6: Completar mais 5 trilhas (Virar Engajado Geral)**

**Body JSON (repetir 5x variando produto.id):**
```json
{
  "event_id": "test-006-missao-02-60",
  "event_type": "usuario.progresso",
  "event": {
    "usuario": {
      "id": 28557630,
      "nome": "Tiago Gladstone",
      "email": "tiagogladstone@gmail.com",
      "doc": null,
      "celular": "+5538997285758",
      "login_auto": "https://membros.academiadosleiloes.com/auth/login?crstk=MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "login_crstk": "MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "gratis": false,
      "pontos": 200,
      "criado_em": "2025-11-04T09:09:21-03:00",
      "ultimo_acesso_em": "2025-11-04T19:30:00-03:00"
    },
    "produto": {
      "id": 481699,
      "ordem": 3,
      "nome": "Missão 02 - Garimpe como um Hunter",
      "oferta_url": null,
      "vitrine": {
        "id": 60122,
        "ordem": 3,
        "nome": "Plano do Arrematador"
      }
    },
    "progresso": 60
  }
}
```

**Sequência de Webhooks (enviar 5 separados):**
1. Missão 02 (id: 481699, ordem: 3) → 60%
2. Missão 03 (id: 215445, ordem: 4) → 60%
3. Missão 04 (id: 481694, ordem: 5) → 60%
4. Missão 05 (id: 215598, ordem: 6) → 60%
5. Missão 06 (id: 481698, ordem: 7) → 60%

**Resultado Final:**
- media_geral = (100 + 50 + 60*5)/11 = 40.9% ✅ (Engajado Geral: 21-60%)
- Aluno agora é classificado como FG=3 (Engajado Geral)

**Disparo de Campanha (ex: Missão 04):**
- media_semana_atual = (100 + 50 + 60 + 60 + 60)/5 = 66% (Engajado)
- Classificação: FG=3, FT=1 (Engajado Geral + Engajado Trilha)
- Template: ID 28 (Engajado Missão 04)

---

### **WEBHOOK 7: Completar 7 trilhas (Virar Recompra)**

**Body JSON:**
```json
{
  "event_id": "test-007-missao-07-100",
  "event_type": "usuario.progresso",
  "event": {
    "usuario": {
      "id": 28557630,
      "nome": "Tiago Gladstone",
      "email": "tiagogladstone@gmail.com",
      "doc": null,
      "celular": "+5538997285758",
      "login_auto": "https://membros.academiadosleiloes.com/auth/login?crstk=MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "login_crstk": "MS06Mzc4OjAzNjc1NTgyOmJ2ZW5oZmg6OnNwNTkzODQ4Mm8xMDU3cjNxMDQ3MnE0M25vOHJyMDYy",
      "gratis": false,
      "pontos": 300,
      "criado_em": "2025-11-04T09:09:21-03:00",
      "ultimo_acesso_em": "2025-11-04T20:45:00-03:00"
    },
    "produto": {
      "id": 295699,
      "ordem": 8,
      "nome": "Missão 07 - Análise Técnica Profunda",
      "oferta_url": null,
      "vitrine": {
        "id": 60122,
        "ordem": 8,
        "nome": "Plano do Arrematador"
      }
    },
    "progresso": 100
  }
}
```

**Atualizar também trilhas anteriores para 100%:**
```sql
-- Executar no Supabase após webhook
UPDATE public.progresso_alunos
SET percentual_progresso = 100
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630)
  AND trilha_id IN (
    SELECT id FROM public.trilhas WHERE ordem <= 7
  );
```

**Resultado Final:**
- media_geral = (100*7)/11 = 63.6% ✅ (Recompra: >60%)
- Classificação agora é FG=2 (Recompra) - IGNORA funil trilha!

**Disparo de Campanha (QUALQUER trilha):**
- Classificação: FG=2, FT=NULL, PG=true
- Template: ID 13 (Recompra - mensagem de upsell)

---

### **WEBHOOK 8: Simular Inatividade (Desengajado Geral)**

**⚠️ ATENÇÃO:** Webhooks não conseguem simular inatividade (não atualizam `data_ultimo_acesso` para o passado).

**Solução:**
```sql
-- Executar manualmente no Supabase
UPDATE public.alunos
SET data_ultimo_acesso = NOW() - INTERVAL '45 days'
WHERE id_externo = 28557630;

-- Reduzir progresso para 1-60%
UPDATE public.progresso_alunos
SET percentual_progresso = 50
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);
```

**Resultado:**
- media_geral = (50*7)/11 = 31.8% (entre 1-60%)
- Inativo há 45 dias
- Classificação: FG=4 (Desengajado Geral)

**Disparo de Campanha:**
- Classificação: FG=4, FT=NULL, PG=true
- Template: ID 12 (Desengajado Geral - recuperação)

---

## 📊 CHECKLIST DE VALIDAÇÃO

### **Para CADA Cenário de Teste:**

- [ ] **1. Setup de Dados**
  - [ ] SQL executado corretamente
  - [ ] `data_primeiro_acesso` e `data_ultimo_acesso` corretos
  - [ ] Progresso inserido/atualizado conforme esperado
  - [ ] Verificar no Supabase: query de validação retorna dados corretos

- [ ] **2. Disparo de Campanha**
  - [ ] Checkbox marcado na planilha (trilha correta)
  - [ ] Workflow Run_Campaign executado sem erros
  - [ ] Logs do N8N mostram execução completa (22 nodes)

- [ ] **3. Classificação Correta**
  - [ ] Verificar tabela `snapshots_alunos_campanhas`:
    ```sql
    SELECT 
      s.id,
      s.funil_global_id,
      s.funil_trilha_id,
      fg.nome_funil as funil_global_nome,
      fe.nome_funil as funil_trilha_nome
    FROM snapshots_alunos_campanhas s
    LEFT JOIN funis_globais fg ON s.funil_global_id = fg.id
    LEFT JOIN funis_especificos fe ON s.funil_trilha_id = fe.id
    WHERE s.aluno_id = (SELECT id FROM alunos WHERE id_externo = 28557630)
    ORDER BY s.data_classificacao DESC
    LIMIT 1;
    ```
  - [ ] `funil_global_id` confere com esperado
  - [ ] `funil_trilha_id` confere com esperado (ou NULL se urgente)

- [ ] **4. Template Correto**
  - [ ] Verificar no output do Node 4.5:
    - [ ] `template_id_whatsapp` = "base"
    - [ ] `id` do template confere com tabela acima
    - [ ] `descricao` faz sentido para o funil

- [ ] **5. Envio WhatsApp + Chatwoot**
  - [ ] Verificar tabela `logs_envios`:
    ```sql
    SELECT 
      le.id,
      le.status,
      le.wamid,
      le.conversa_id_chatwoot,
      le.mensagem_id_chatwoot,
      le.data_envio
    FROM logs_envios le
    WHERE le.aluno_id = (SELECT id FROM alunos WHERE id_externo = 28557630)
    ORDER BY le.data_envio DESC
    LIMIT 1;
    ```
  - [ ] `status` = 'sucesso'
  - [ ] `wamid` preenchido (confirma envio WhatsApp)
  - [ ] `conversa_id_chatwoot` e `mensagem_id_chatwoot` preenchidos

- [ ] **6. Mensagem no Chatwoot**
  - [ ] Abrir Chatwoot e verificar conversa do contato
  - [ ] Mensagem aparece como nota privada
  - [ ] Conteúdo: "Oi *Tiago* ,tudo bem com você???" (placeholder substituído)

- [ ] **7. Dashboard Atualizado**
  - [ ] Verificar aba ALUNOS_DASHBOARD na planilha:
    - [ ] Linha com email `tiagogladstone@gmail.com` presente
    - [ ] Funis preenchidos corretamente
    - [ ] Status = "sucesso"
    - [ ] Mensagem enviada presente na coluna G

---

## 🎯 PLANO DE EXECUÇÃO SUGERIDO

### **Fase 1: Funis Urgentes (2h)**
1. Cenário A1 - Nunca Acessou
2. Cenário A2 - Recompra
3. Cenário A3 - Desengajado Geral

**Meta:** Validar que templates globais são usados corretamente (ignoram trilha).

---

### **Fase 2: Engajado Geral - Trilhas Iniciais (2h)**
1. B1 - Engajado na Boas Vindas
2. B2 - Desengajado na Boas Vindas
3. B3-B4 - Engajado/Desengajado Missão 01

**Meta:** Validar lógica de classificação dual e uso de templates específicos.

---

### **Fase 3: Engajado Geral - Demais Trilhas (2h)**
1. B5-B22 - Testar 1 trilha "meio de curso" (ex: Missão 05)
2. B21-B22 - Testar última trilha (Missão 10)

**Meta:** Validar que cálculo de `media_semana_atual` funciona para qualquer ordem.

---

### **Fase 4: Primeiro Acesso (1h)**
1. C1 - Primeiro Acesso + Engajado
2. C2 - Primeiro Acesso + Desengajado

**Meta:** Validar que alunos novos (<20% média) recebem templates específicos.

---

### **Fase 5: Transições Entre Funis (1h)**
1. Nunca Acessou → Primeiro Acesso (enviar webhook progresso 0%)
2. Primeiro Acesso → Engajado Geral (completar mais trilhas)
3. Engajado Geral → Recompra (>60%)
4. Engajado Geral → Desengajado Geral (simular inatividade)

**Meta:** Validar que sistema detecta mudança de funil corretamente.

---

## 📈 MÉTRICAS DE SUCESSO

**Taxa de Acerto Esperada:** 100% (23/23 cenários)

**Métricas por Fase:**
- Classificação correta: 100%
- Template correto: 100%
- Envio WhatsApp sucesso: >95% (algumas falhas de API são esperadas)
- Espelhamento Chatwoot: 100%
- Registro em logs: 100%

**Tempo Total Estimado:** 6-8 horas (incluindo setup + validações + debugging)

---

## 🐛 TROUBLESHOOTING

### **Problema 1: Aluno não é classificado**
**Sintoma:** Snapshot não criado ou funil_global_id = 0

**Causas Possíveis:**
1. Lógica de classificação tem gap não coberto
2. Dados de setup incorretos (datas, progresso)
3. Bug no Node 4.3 (Code JavaScript)

**Solução:**
1. Verificar output do Node 4.2 (métricas calculadas)
2. Debugar Node 4.3 com `console.log()`
3. Validar condições no código JavaScript

---

### **Problema 2: Template errado retornado**
**Sintoma:** Node 4.5 retorna template de funil diferente

**Causas Possíveis:**
1. Flag `prioridade_global` incorreta no Node 4.4
2. Templates duplicados no banco (mesma combinação funil+trilha)
3. Template esperado está com `ativo = false`

**Solução:**
1. Verificar output do Node 4.4 (campo `prioridade_global`)
2. Query de detecção de duplicados (no documento principal)
3. Ativar template: `UPDATE templates SET ativo = true WHERE id = X`

---

### **Problema 3: Envio WhatsApp falha**
**Sintoma:** `status = 'falha'` em `logs_envios`

**Causas Possíveis:**
1. Celular inválido (não passa validação Meta)
2. Template "base" não aprovado no WhatsApp Business
3. Credenciais Meta API expiradas
4. Rate limit Meta API (muitos envios em sequência)

**Solução:**
1. Validar formato celular: `55XXXXXXXXXXX`
2. Verificar status template no Meta Business Manager
3. Renovar token de acesso (válido por 60 dias)
4. Aguardar 1 minuto entre disparos

---

### **Problema 4: Mensagem não aparece no Chatwoot**
**Sintoma:** `mensagem_id_chatwoot = NULL` em `logs_envios`

**Causas Possíveis:**
1. Credenciais Chatwoot incorretas na Tool
2. Inbox_id errado (não existe no Chatwoot)
3. API Chatwoot fora do ar
4. Contact_id não foi criado (falha no Node 3 da Tool)

**Solução:**
1. Testar credenciais Chatwoot manualmente (Postman)
2. Verificar inbox_id na Tool (deve ser 1)
3. Verificar logs do Chatwoot (container Docker)
4. Reprocessar aluno (checkbox novamente)

---

## 📝 SCRIPT DE LIMPEZA (Entre Testes)

```sql
-- Executar ANTES de cada novo teste para garantir estado limpo

-- 1. Limpar snapshots de campanhas anteriores
DELETE FROM public.snapshots_alunos_campanhas 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

-- 2. Limpar logs de envio
DELETE FROM public.logs_envios 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

-- 3. Limpar mensagens Chatwoot
DELETE FROM public.mensagens_chatwoot 
WHERE conversa_id IN (
  SELECT id FROM public.conversas_chatwoot 
  WHERE contact_id_chatwoot IN (
    SELECT contact_id_chatwoot FROM public.alunos WHERE id_externo = 28557630
  )
);

-- 4. Limpar conversas Chatwoot
DELETE FROM public.conversas_chatwoot 
WHERE contact_id_chatwoot IN (
  SELECT contact_id_chatwoot FROM public.alunos WHERE id_externo = 28557630
);

-- 5. Limpar progresso do aluno
DELETE FROM public.progresso_alunos 
WHERE aluno_id = (SELECT id FROM public.alunos WHERE id_externo = 28557630);

-- 6. Resetar datas do aluno (manter cadastro base)
UPDATE public.alunos 
SET 
  data_primeiro_acesso = NULL,
  data_ultimo_acesso = NULL,
  contact_id_chatwoot = NULL
WHERE id_externo = 28557630;

-- 7. Limpar campanhas de teste
DELETE FROM public.campanhas 
WHERE status = 'processando' 
   OR (status = 'concluida' AND total_processados <= 1);
```

---

## 🔧 SCRIPT DE ISOLAMENTO DO ALUNO DE TESTE

**⚠️ IMPORTANTE:** Execute este script **UMA ÚNICA VEZ** no início dos testes para garantir que apenas o aluno Tiago seja processado pelas campanhas.

### **Problema:**
O campo `ativo` na tabela `alunos` é controlado por um **trigger automático** (`trigger_atualizar_aluno_automatico`) que valida o formato do celular:
- ✅ Celular válido (formato: `^55[0-9]{11}$`) → `ativo = true`
- ❌ Celular inválido ou NULL → `ativo = false`

Quando você tenta fazer `UPDATE alunos SET ativo = false`, o trigger **revalida o celular e sobrescreve** o valor se o formato for válido.

### **Solução:**
Desabilitar temporariamente o trigger, fazer o UPDATE, e reabilitar:

```sql{{ [
  $('Start').first().json.aluno_id,
  $('Criar Conversa no Chatwoot').first().json.id,
  $('Buscar Dados do Contato + Contexto Histórico').first().json.contact_id_chatwoot,
  $('Buscar Dados do Contato + Contexto Histórico').first().json.contexto_historico,
  'Bot enviou template de campanha: "' + $('Preparar Dados + Validações').first().json.mensagem_conteudo + '"',
  $('Merge').first().json.messages[0].id,
  $('Preparar Dados + Validações').first().json.mensagem_conteudo,
  $('Start').first().json.campanha_id,
  $('Start').first().json.aluno_id,
  $('Buscar Dados Completos').first().json.id,
  $('Merge').first().json.messages[0].id
] }}
-- ===================================================================
-- SCRIPT DE ISOLAMENTO - Executar UMA VEZ no início dos testes
-- ===================================================================

-- 1. DESABILITAR TRIGGER (permite UPDATE manual do campo ativo)
ALTER TABLE public.alunos DISABLE TRIGGER trigger_atualizar_aluno_automatico;

-- 2. DESATIVAR TODOS OS ALUNOS EXCETO TIAGO
UPDATE public.alunos 
SET ativo = false 
WHERE id != 'cb6d71a3-40df-4e21-9333-d86b7ccbfd59';

-- 3. GARANTIR QUE TIAGO ESTÁ ATIVO
UPDATE public.alunos 
SET ativo = true 
WHERE id = 'cb6d71a3-40df-4e21-9333-d86b7ccbfd59';

-- 4. REABILITAR TRIGGER (restaura comportamento normal)
ALTER TABLE public.alunos ENABLE TRIGGER trigger_atualizar_aluno_automatico;
```

### **Validação:**

```sql
-- Verificar quantos alunos ativos/inativos
SELECT 
  COUNT(*) FILTER (WHERE ativo = true) as ativos,
  COUNT(*) FILTER (WHERE ativo = false) as inativos,
  COUNT(*) as total
FROM public.alunos;
```

**Resultado esperado:**
- `ativos`: 1 (apenas Tiago)
- `inativos`: 52 (todos os outros)
- `total`: 53

```sql
-- Confirmar dados do Tiago
SELECT 
  nome_completo, 
  celular, 
  ativo,
  data_primeiro_acesso,
  data_ultimo_acesso
FROM public.alunos 
WHERE id = 'cb6d71a3-40df-4e21-9333-d86b7ccbfd59';
```

**Resultado esperado:**
- `nome_completo`: Tiago Gladstone
- `celular`: 5538997285758
- `ativo`: **true** ✅
- `data_primeiro_acesso`: NULL (para teste A1)
- `data_ultimo_acesso`: NULL

### **⚠️ ATENÇÃO:**

1. **Execute o script de isolamento APENAS UMA VEZ** no início dos testes
2. **NÃO execute novamente** entre testes (não é necessário)
3. Após os testes, você pode **reativar todos os alunos** executando:
   ```sql
   ALTER TABLE public.alunos DISABLE TRIGGER trigger_atualizar_aluno_automatico;
   UPDATE public.alunos SET ativo = true WHERE celular ~ '^55[0-9]{11}$';
   ALTER TABLE public.alunos ENABLE TRIGGER trigger_atualizar_aluno_automatico;
   ```

### **Por Que Isso é Necessário:**

O workflow `[CS] Run_Campaign` (Node 3.1 - Get All Alunos) filtra automaticamente apenas alunos com `ativo = true`:

```sql
SELECT id, apelido, celular, data_primeiro_acesso, data_ultimo_acesso
FROM public.alunos
WHERE celular IS NOT NULL 
  AND celular != ''
  AND ativo = true;  -- ⬅️ FILTRO CRÍTICO
```

Sem o isolamento, o workflow processaria **todos os 49 alunos ativos reais**, enviando mensagens WhatsApp para clientes de produção durante os testes! 🚨

---

## ✅ CONCLUSÃO

Este plano cobre:
- ✅ Todos os 5 funis globais
- ✅ Todos os 2 funis de trilha
- ✅ Todas as 11 trilhas (10 missões + boas vindas)
- ✅ 23 cenários únicos de classificação
- ✅ Transições entre funis via webhooks
- ✅ Validação completa de ponta a ponta

**Próximos Passos:**
1. Executar Fase 1 (Funis Urgentes)
2. Documentar bugs encontrados
3. Ajustar lógica se necessário
4. Repetir Fases 2-5
5. Validar sistema em produção com 10+ alunos reais

---

**Documento criado em:** 04/11/2025  
**Autor:** GitHub Copilot  
**Versão:** 1.0  
**Status:** Pronto para Execução
