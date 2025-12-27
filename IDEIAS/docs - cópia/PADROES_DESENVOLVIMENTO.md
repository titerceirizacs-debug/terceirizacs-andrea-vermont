# 🛡️ PADRÕES DE DESENVOLVIMENTO - TerceirizaCS

**Versão:** 1.0  
**Data:** 01/11/2025  
**Status:** ✅ Obrigatório para todos os novos workflows  
**Auditoria de Segurança:** 100% Completa (12 vulnerabilidades corrigidas em 01/11/2025)

---

## 📋 OBJETIVO

Este documento estabelece **padrões obrigatórios** para desenvolvimento de workflows N8N no TerceirizaCS, garantindo segurança contra SQL/JSON injection e manutenibilidade do código.

**Regra de Ouro:** 🚫 **NUNCA use interpolação direta `{{ }}` em queries SQL ou JSON bodies de APIs**

---

## ✅ POSTGRES NODES - PADRÃO OBRIGATÓRIO

### **Query Parameters (Formato Array)**

**✅ SEMPRE faça assim:**

```sql
-- Query SQL
SELECT * FROM tabela WHERE campo = $1 AND outro_campo = $2

-- Query Parameters (no campo "Query Parameters" do N8N)
{{ [ $json.valor1, $json.valor2 ] }}
```

**Características:**
- ✅ Proteção contra SQL injection
- ✅ N8N mapeia automaticamente para `$1`, `$2`, `$3`, etc.
- ✅ Query Parameters **DEVE SER ARRAY** `{{ [ ] }}`, não string separada por vírgula
- ✅ Funciona com qualquer tipo de dado (string, number, boolean, null, UUID)

---

### **Type Casting (Postgres)**

**UUIDs:**
```sql
WHERE id = $1::uuid
```

**Integers:**
```sql
WHERE conversation_id = $1::integer
```

**Booleans:**
```sql
-- Se campo é boolean no banco, use CASE WHEN
WHERE is_active = CASE WHEN $1 IS NOT NULL AND $1 != '' THEN true ELSE false END
```

**NULL Handling:**
```sql
-- Converte string vazia em NULL
WHERE optional_field = NULLIF($1, '')
```

---

### **❌ NUNCA faça:**

```sql
-- ❌ Interpolação direta (SQL Injection vulnerável)
WHERE campo = '{{ $json.valor }}'

-- ❌ Query Parameters como string (causa erro "value too long")
{{ $json.valor1, $json.valor2 }}

-- ❌ Concatenação de strings
WHERE nome = 'Bruno ' + '{{ $json.sobrenome }}'
```

---

## ✅ HTTP REQUEST NODES - JSON BODY

### **Using Fields Below (Padrão Seguro)**

**✅ SEMPRE faça assim:**

**Configuração do Node:**
- **Send Body:** ON
- **Body Content Type:** JSON
- **Specify Body:** **Using Fields Below** ⬅️ CRÍTICO

**Body Parameters:**
```
Name: campo1  |  Value: ={{ $json.valor }}
Name: campo2  |  Value: texto_fixo
Name: campo3  |  Value: ={{ $json.outro_valor }}
```

**Características:**
- ✅ N8N escapa automaticamente caracteres especiais
- ✅ Proteção contra JSON injection
- ✅ Validação de tipos
- ✅ Suporta objetos aninhados

---

### **❌ NUNCA faça:**

```json
// ❌ Specify Body: "Using JSON" com interpolação
{
  "campo": "{{ $json.valor }}",
  "outro": "{{ $json.texto }}"
}
```

**Por quê?** Se `$json.texto` contiver aspas (`"`), quebra o JSON ou permite injection.

---

## ✅ HTTP REQUEST NODES - QUERY PARAMETERS

### **Using Fields Below (Padrão Seguro)**

**✅ SEMPRE faça assim:**

**Configuração do Node:**
- **Send Query Parameters:** Using Fields Below

**Query Parameters:**
```
Name: param1  |  Value: ={{ $json.valor }}
Name: param2  |  Value: 123
```

**Resultado:** `https://api.com/endpoint?param1=valor_escapado&param2=123`

---

### **❌ NUNCA faça:**

```
// ❌ Interpolação direta na URL
https://api.com/endpoint?param={{ $json.valor }}
```

**Por quê?** Permite URL injection (caracteres especiais não escapados).

---

## ✅ PATH PARAMETERS (URLs)

### **Quando é SEGURO:**

```
✅ IDs numéricos vindos de API/webhook confiável:
   /accounts/{{ $json.id }}/conversations/{{ $json.conv_id }}

✅ UUIDs (formato rígido, baixo risco):
   /items/{{ $json.uuid }}

✅ Valores enumerados conhecidos:
   /status/{{ $json.status }}  (se status ∈ {'open', 'closed', 'pending'})
```

### **Quando é VULNERÁVEL:**

```
❌ Strings de usuário final:
   /users/{{ $json.username }}/profile

❌ Termos de busca:
   /search/{{ $json.query }}/results

❌ Qualquer input não validado
```

**Solução:** Use Query Parameters (Using Fields Below) ao invés de Path Parameters para inputs de usuário.

---

## 📊 EXEMPLOS PRÁTICOS

### **Exemplo 1: INSERT com Query Parameters**

```sql
-- Query
INSERT INTO mensagens_chatwoot (
    conversa_id,
    conteudo,
    tipo_mensagem,
    agent_id,
    is_agent,
    data_criacao
)
VALUES (
    $1,
    $2,
    $3,
    NULLIF($4, ''),
    CASE WHEN $5 IS NOT NULL AND $5 != '' THEN true ELSE false END,
    NOW()
)
RETURNING id;

-- Query Parameters
{{ [ 
  $('Buscar UUID').first().json.conversa_id,
  $('Start').first().json.conteudo,
  $('Start').first().json.tipo_mensagem,
  $('Start').first().json.agent_id,
  $('Start').first().json.agent_id
] }}
```

---

### **Exemplo 2: UPDATE com Query Parameters**

```sql
-- Query
UPDATE public.conversas_chatwoot
SET 
    resumo_evolutivo = $1,
    data_ultima_interacao = NOW()
WHERE 
    conversation_id_chatwoot = $2
RETURNING id, resumo_evolutivo;

-- Query Parameters
{{ [ 
  $('Gemini LLM').item.json.text,
  $('Start').item.json.conversation_id
] }}
```

---

### **Exemplo 3: SELECT com JOINs e Query Parameters**

```sql
-- Query
SELECT 
    a.id as aluno_id,
    a.nome_completo,
    t.nome_trilha,
    p.percentual_progresso
FROM 
    public.alunos a
    INNER JOIN public.trilhas t ON t.id = $1::uuid
    INNER JOIN public.progresso_alunos p ON p.aluno_id = a.id AND p.trilha_id = $1::uuid
WHERE 
    a.id = $2::uuid
LIMIT 1;

-- Query Parameters
{{ [ 
  $json.trilha_id,
  $json.aluno_id
] }}
```

**Nota:** Correlações como `p.aluno_id = a.id` são **seguras** (não são interpolações).

---

### **Exemplo 4: CTE Complexo com 11 Parâmetros**

```sql
-- Query
WITH nova_conversa AS (
    INSERT INTO conversas_chatwoot (aluno_id, conversation_id_chatwoot, contact_id_chatwoot)
    VALUES ($1::uuid, $2::integer, $3::integer)
    RETURNING id
),
nova_mensagem AS (
    INSERT INTO mensagens_chatwoot (conversa_id, message_id_chatwoot, conteudo)
    VALUES ((SELECT id FROM nova_conversa), $4, $5)
    RETURNING id
)
INSERT INTO logs_envios (campanha_id, aluno_id, template_id, wamid)
SELECT $6::uuid, $7::uuid, $8::uuid, $9
RETURNING id;

-- Query Parameters (11 elementos)
{{ [ 
  $('Start').json.aluno_id,
  $('Chatwoot Conversa').json.id,
  $('Chatwoot Conversa').json.contact_id,
  $('WhatsApp').json.messages[0].id,
  $('Template').json.conteudo,
  $('Start').json.campanha_id,
  $('Start').json.aluno_id,
  $('Start').json.template_id,
  $('WhatsApp').json.messages[0].id
] }}
```

**Nota:** CTEs podem referenciar resultados anteriores via subqueries (ex: `SELECT id FROM nova_conversa`).

---

### **Exemplo 5: HTTP Request com "Using Fields Below"**

**Node: Criar Conversa no Chatwoot**

**Configuração:**
- Method: POST
- URL: `https://app.chatwoot.com/api/v1/accounts/{{ $('Config').json.account_id }}/conversations`
- Authentication: Bearer Token
- Send Body: ON
- Body Content Type: JSON
- **Specify Body: Using Fields Below**

**Body Parameters:**
```
Name: source_id        | Value: ={{ $('Start').json.aluno_id }}
Name: inbox_id         | Value: 123
Name: contact_id       | Value: ={{ $('Buscar Contact').json.contact_id }}
Name: status           | Value: open
Name: custom_attributes| Value: ={{ { "trilha": $('Start').json.trilha_nome } }}
```

**JSON Resultante (gerado automaticamente pelo N8N):**
```json
{
  "source_id": "55555555-5555-5555-5555-555555555555",
  "inbox_id": 123,
  "contact_id": 456,
  "status": "open",
  "custom_attributes": {
    "trilha": "Semana 01: Fundamentos"
  }
}
```

---

## 🧪 CHECKLIST DE VALIDAÇÃO

Antes de aprovar um novo workflow, verificar:

### **Postgres Nodes:**
- [ ] Todas as queries usam Query Parameters (formato array `{{ [ ] }}`)
- [ ] Nenhuma interpolação `{{ }}` direta em WHERE/SET/VALUES
- [ ] Type casting correto (`::uuid`, `::integer`, etc.)
- [ ] NULL handling implementado (`NULLIF()`, `CASE WHEN` para booleans)
- [ ] Correlações de tabelas (JOINs) não foram parametrizadas

### **HTTP Request Nodes:**
- [ ] JSON Body usa "Using Fields Below" (não "Using JSON")
- [ ] Query Parameters usa "Using Fields Below" (não interpolação na URL)
- [ ] Path Parameters são apenas IDs/UUIDs de fontes confiáveis
- [ ] Nenhum input de usuário final em URLs sem validação

### **Testes:**
- [ ] Testado com valores normais
- [ ] Testado com valores NULL/vazios
- [ ] Testado com caracteres especiais (aspas, quebras de linha, emojis)
- [ ] Testado com inputs grandes (>1000 chars)

---

## 🔍 AUDITORIA DE SEGURANÇA (01/11/2025)

**Status:** ✅ 100% Completa

**Workflows Auditados (12/12):**
1. ✅ [tool] Registrar Mensagem Chatwoot - 1 correção
2. ✅ [CS] Chatwoot - Central - 0 correções (já seguro)
3. ✅ [CS] Chatwoot - Status Changed - 0 correções (já seguro)
4. ✅ [CS] Run_Campaign - 3 correções
5. ✅ [tool] Enviar WhatsApp + Chatwoot - 5 correções
6. ✅ [tool] Buscar Dossier CS - 1 correção
7. ✅ [tool] Gerar e Salvar Resumo Evolutivo - 2 correções
8. ✅ [tool] Condensar Resumo Historico - 0 correções (sem SQL)
9. ✅ [tool] Enviar Mensagem Picada Chatwoot - 0 correções (sem SQL)
10. ✅ [tool] Gerar Resumo Final - 0 correções (sem SQL)
11. ✅ [CS] Sync_Sheets_Config - 0 correções (SELECT estático)
12. ✅ [tool] Processamento de Mensagens - 0 correções (sem SQL)

**Workflow Futuro (não implementado):**
- 🔵 [CS] Send_Broadcast - Será implementado com padrões corretos desde o início

**Total de Vulnerabilidades Corrigidas:** 12  
**Query Parameters Implementados:** 30+  
**Taxa de Segurança:** 100%

---

## 📚 LIÇÕES APRENDIDAS

### **1. Query Parameters DEVE ser array**
```javascript
// ❌ ERRADO (causa erro "value too long for type character varying(20)")
{{ $json.valor1, $json.valor2 }}

// ✅ CORRETO
{{ [ $json.valor1, $json.valor2 ] }}
```

### **2. NULLIF() é essencial para campos opcionais**
```sql
-- ✅ Converte string vazia em NULL
WHERE optional_field = NULLIF($1, '')
```

### **3. CASE WHEN para conversão boolean**
```sql
-- ✅ N8N pode enviar boolean como string, SQL converte
WHERE is_agent = CASE WHEN $1 IS NOT NULL AND $1 != '' THEN true ELSE false END
```

### **4. Correlações de tabelas são SEGURAS**
```sql
-- ✅ Não parametrizar (é referência de coluna, não input externo)
WHERE pa.aluno_id = a.id

-- ✅ Não parametrizar (subquery correlacionado)
SELECT * FROM conversas WHERE aluno_id = a.id
```

### **5. Type casting previne erros**
```sql
-- ❌ Pode causar erro "operator does not exist: text = integer"
WHERE conversation_id = $1

-- ✅ Especifica tipo explicitamente
WHERE conversation_id = $1::integer
```

---

## 🚨 ERROS COMUNS E SOLUÇÕES

| Erro | Causa | Solução |
|------|-------|---------|
| `value too long for type character varying(20)` | Query Parameters como string ao invés de array | Usar `{{ [ ] }}` |
| `operator does not exist: text = integer` | Type mismatch | Adicionar `::integer` ou `::uuid` |
| `syntax error at or near "$1"` | Query Parameters vazio ou mal formatado | Verificar formato array |
| JSON injection em HTTP Request | "Using JSON" com interpolação | Usar "Using Fields Below" |
| URL injection | Interpolação direta em query params | Usar "Using Fields Below" |

---

## 📖 REFERÊNCIAS

- **Documentação N8N Postgres:** https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/
- **Documentação N8N HTTP Request:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/
- **PostgreSQL Query Parameters:** https://www.postgresql.org/docs/current/sql-prepare.html

---

## 🔄 HISTÓRICO DE VERSÕES

### v1.0 (01/11/2025)
- ✅ Documento criado com padrões obrigatórios
- ✅ Exemplos práticos de todos os casos (INSERT, UPDATE, SELECT, CTE, HTTP)
- ✅ Checklist de validação
- ✅ Lições aprendidas da auditoria de segurança
- ✅ Referências e troubleshooting

---

**Status:** ✅ Documento OFICIAL - Uso Obrigatório  
**Última Atualização:** 01/11/2025  
**Próxima Revisão:** Quando necessário (se novos padrões emergirem)
