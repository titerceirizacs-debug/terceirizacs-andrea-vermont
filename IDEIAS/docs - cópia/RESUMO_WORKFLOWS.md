# RESUMO DOS WORKFLOWS - TerceirizaCS v2.0

**Data de Criação:** 30 de Outubro de 2025  
**Última Atualização:** 18 de Novembro de 2025 (v2.4)  
**Autor:** Tiago Gladstone + GitHub Copilot  
**Versão do Documento:** 2.4  
**Status:** ✅ Validado com [CS] Chatwoot - Central v2.0.7

---

## 📋 OBJETIVO DESTE DOCUMENTO

Este documento é uma **referência rápida consolidada** de todos os workflows do sistema TerceirizaCS. Para detalhes técnicos completos (nodes, queries, códigos), consulte os arquivos individuais em `/workflows/`.

**Diferença entre documentos:**
- **FLUXO_DE_TRABALHO.md** - Fluxo de negócio (como o sistema funciona de ponta a ponta)
- **RESUMO_WORKFLOWS.md** (este) - Visão técnica consolidada de cada workflow
- **MAPA_DE_DEPENDENCIAS.md** - Relacionamentos entre componentes

---

## 🎯 VISÃO GERAL DO SISTEMA

### Status Atual do MVP (Atualizado 18/11/2025)

| Workflow | Status | Nodes | Data Conclusão | Prioridade |
|----------|--------|-------|----------------|------------|
| **[CS] Run_Campaign** | ✅ 100% | 22/22 | 29/10/2025 | MVP CORE |
| **[CS] Chatwoot - Central** | ✅ 100% | 33/33 | 18/11/2025 (v2.0.7) | MVP CORE |
| **[CS] Chatwoot - Status Changed** | ✅ 100% | 6/6 | 30/10/2025 | MVP CORE |
| **[CS] Sync_Sheets_Config** | ✅ 100% | 4/4 | 29/10/2025 | MVP CORE |
| **[CS] Sync_External_Data** | ✅ 100% | 9/9 | 03/11/2025 (v3.1) | MVP CORE |

**MVP Real:** 100% (5 de 5 workflows principais operacionais)

---

## 🚀 WORKFLOWS PRINCIPAIS

### 1. [CS] Run_Campaign

**Arquivo:** `/workflows/[CS] Run_Campaign.md` (1764 linhas)  
**Versão Atual:** v4.3  
**Status:** ✅ 100% IMPLEMENTADO  
**Data de Conclusão:** 29 de Outubro de 2025  
**Última Atualização:** 10 de Novembro de 2025 (v4.3 - fix registros duplicados)

#### **Objetivo**
Disparar campanhas automatizadas de mensagens WhatsApp para alunos, classificando-os em funis (global + trilha) e enviando templates personalizados.

#### **Estrutura (22 Nodes)**

| Bloco | Nodes | Função Principal |
|-------|-------|------------------|
| **1. Gatilho e Segurança** | 1.1 - 1.4 | Trigger (1min), Ler planilha CONTROLE, Filtrar checkbox, Desmarcar gatilho |
| **2. Preparação e Validação** | 2.1 - 2.6 | Atualizar status "Iniciando", Limpar outputs, Buscar Trilha ID, Criar campanha no banco, Validar configuração |
| **3. Coleta de Dados** | 3.1 | Buscar todos os alunos com celular cadastrado |
| **4. Loop Principal** | 4.1 - 4.7 | Loop sobre alunos, Buscar progresso, Classificação DUAL, Registrar snapshot, Buscar template, **Enviar WhatsApp + Chatwoot** (Tool), Processar retorno |
| **5. Finalização** | 5.2 - 5.6 | Atualizar status campanha, Buscar alunos processados, Limpar/Escrever dashboard, Atualizar planilha CONTROLE |

#### **Ferramentas Utilizadas**
- **[tool] Enviar WhatsApp + Chatwoot** (Node 4.6) - ✅ 100% implementada (27 nodes v1.3)

#### **Gatilhos**
- **Automático:** Schedule Trigger (1 minuto)
- **Manual:** Menu Google Sheets → 🚀 Automações CS → ▶ Disparar Campanha

#### **Tabelas do Banco**
- **Leitura:** `alunos`, `trilhas`, `templates`, `progresso_alunos`, `funis_globais`, `funis_especificos`
- **Escrita:** `campanhas`, `snapshots_alunos_campanhas`, `logs_envios`, `conversas_chatwoot`, `mensagens_chatwoot`

#### **Planilhas Google Sheets**
- **CONTROLE** (Leitura + Escrita) - Operador marca checkbox para disparar
- **ALUNOS_DASHBOARD** (Escrita) - Dashboard com 7 colunas (incluindo mensagem_enviada)

#### **Integrações Externas**
- Meta WhatsApp Business API (envio de templates)
- Chatwoot API (espelhamento de mensagens)
- Google Sheets API (controle e dashboard)

#### **Melhorias v4.1 (29/10/2025)**
- ✅ Node 2.0a: Limpar outputs anteriores (previne confusão com dados antigos)
- ✅ Coluna `mensagem_enviada` (G) no ALUNOS_DASHBOARD
- ✅ Dashboard ALUNOS_DASHBOARD com 7 colunas (era 6)

#### **Métricas de Performance**
- **Tempo médio:** ~1-2 minutos para 50 alunos
- **Taxa de sucesso esperada:** >98%
- **Custo por disparo:** ~R$ 0,07 por mensagem (WhatsApp template)

---

### 2. [CS] Chatwoot - Central

**Arquivo:** `/workflows/[CS] Chatwoot - Central.md` (6750+ linhas)  
**Versão Atual:** v2.0.6 (Handoff Invisível)  
**Status:** ✅ 100% IMPLEMENTADO  
**Data de Conclusão:** 30 de Outubro de 2025  
**Última Atualização:** 17 de Novembro de 2025 (v2.0.6 - Handoff Invisível)

#### **Objetivo**
Atendimento automatizado via AI Agent (GPT-4.5-nano + Gemini 2.5 Flash Lite) no Chatwoot, processando mensagens multimodais (texto/áudio/imagem) e gerenciando Sistema de Memória Hierárquica com Tags Soberanas.

#### **Estrutura (33 Nodes) - ATUALIZADO v2.0.6**

**BLOCO 1: RECEPÇÃO E ROTEAMENTO (4 nodes)**
- Node 1.1: Webhook Chatwoot (`message.created`)
- Node 1.2: Padronizar Formato (Switch private/não-private)
- Node 1.3: IF Private → STOP (mensagens internas não processadas)
- Node 1.4: Identificar Remetente (agent vs aluno)

**BLOCO 2: IDENTIFICAÇÃO E VALIDAÇÃO (15 nodes)**
- **Sub-Bloco 2.1:** Buscar Aluno no Banco (5 nodes)
  - Buscar por celular → IF found (prosseguir) / IF not (criar aluno novo)
  - UPSERT conversas_chatwoot (contexto_historico, resumo_evolutivo)
- **Sub-Bloco 2.2:** Controle de Atendimento (10 nodes)
  - Verificar assignee_id
  - IF assigned a humano → Tool Registrar Mensagem → STOP (bot não processa)
  - IF assigned a bot → Prosseguir (bot processa)
  - IF sem assignee → Atribuir bot automaticamente

**BLOCO 3: PROCESSAMENTO IA (14 nodes) - ATUALIZADO v2.0.6**
- **Sub-Bloco 3.1:** Buscar Contexto Completo (2 nodes)
  - Tool Buscar Dossier CS (funis + progresso + tags)
  - Merge dossier com contexto conversa
- **Sub-Bloco 3.2:** Processar Mensagem (3 nodes)
  - Tool Processamento de Mensagens (Whisper + Vision)
  - Debounce System (7 nodes internos) - **DESABILITADO temporariamente**
  - Merge conteúdo textualizado
- **Sub-Bloco 3.3:** Preparar Prompt IA (2 nodes)
  - Preparar prompt_system (dossier + contexto + histórico)
  - Preparar prompt_user (mensagem textualizada)
- **Sub-Bloco 3.4:** AI Agent (2 nodes)
  - GPT-4.5-nano (resposta + Router Actions detection)
  - Gemini 2.5 Flash Lite (Supervisor IA - decisão de ações)
- **Sub-Bloco 3.5:** Atualizar Resumos (4 nodes)
  - Tool Gerar Resumo Evolutivo (working memory)
  - IF tokens >4000 → Tool Condensar Resumo Historico
  - Merge resumos atualizados
- **Sub-Bloco 3.6:** Supervisor IA - Sistema de Tags v2.2 (5 nodes)
  - Node 3.6.5: Gemini 2.5 Flash analisa conversa → detecta tags (objetivos + conquistas)
  - Tags detectadas: JSON array (ex: ["objetivo-arrematar", "concluiu-modulo-1"])
- **Sub-Bloco 3.7:** Router Actions (7 nodes totais - v2.0.6 HANDOFF INVISÍVEL)
  - **Sub-Bloco 3.7.1:** Reply (4 nodes)
    - Tool Enviar Mensagem Picada (quebra inteligente + delay dinâmico)
    - Tool Registrar Mensagem Cliente
    - Tool Registrar Mensagem Bot
    - Tool Gerar Resumo
  - **Sub-Bloco 3.7.2:** Handoff (3 nodes) ← **REDUZIDO de 6 para 3 nodes (v2.0.6)**
    - ❌ **REMOVIDO:** Node 3.7.2.1 (Enviar Mensagem Picada ao Cliente)
    - ❌ **REMOVIDO:** Node 3.7.2.1.5 (Registrar Mensagem Cliente - duplicado)
    - ❌ **REMOVIDO:** Node 3.7.2.1.6 (Registrar Mensagem Bot - sem mensagem enviada)
    - ✅ Node 3.7.2.2: Tool Gerar Resumo (Wait ON - usado na nota privada)
    - ✅ Node 3.7.2.3: Nota Privada (HTTP Request - contexto completo para humano)
    - ✅ Node 3.7.2.4: Assign to Human (HTTP Request - ID 2 bloqueia bot)
    - **ESTRATÉGIA HANDOFF INVISÍVEL:** Cliente NÃO recebe mensagem, transição silenciosa preserva aparência de atendimento 100% humano
  - **Sub-Bloco 3.7.3:** Resolve (6 nodes) - **DESCONECTADO v2.0.3**
    - ⚠️ Branch desabilitado (bot não pode mais marcar conversas como resolvidas)
  - **Sub-Bloco 3.7.4:** Aplicar Tags (4 nodes paralelos) - **Tags Soberanas**
    - Node 3.7.4.1: IF (tem tags detectadas?)
    - Node 3.7.4.2: Code (preparar arrays objetivos/conquistas)
    - Node 3.7.4.3: Postgres (UPDATE alunos SET tags_objetivos[], tags_conquistas[] - **Source of Truth**)
    - Node 3.7.4.4: Chatwoot Labels API (espelhamento read-only das tags)

#### **Arquitetura 2 Cérebros**
- **GPT-4.5-nano:** Respostas conversacionais + Router Actions (Reply/Handoff/Resolve)
- **Gemini 2.5 Flash Lite:** Supervisor IA (detecção de tags, análise semântica, resumos)

#### **Ferramentas Utilizadas (8 Tools - 100% validadas)**
1. **[tool] Buscar Dossier CS** (Node 2.1b) - 3 nodes v1.1
2. **[tool] Processamento de Mensagens** (Node 3.2a) - 16 nodes v1.0 (inclui 7 nodes debounce DISABLED)
3. **[tool] Gerar Resumo Evolutivo** (Node 3.5a) - 4 nodes v1.0
4. **[tool] Condensar Resumo Historico** (Node 3.5b condicional) - 6 nodes v2.0
5. **[tool] Gerar Resumo Final** (usado por Status Changed) - 5 nodes v1.0
6. **[tool] Registrar Mensagem Chatwoot** (7 pontos de chamada - v1.8a) - 4 nodes v1.4
7. **[tool] Enviar WhatsApp + Chatwoot** (usado por Run_Campaign) - 27 nodes v1.3
8. **[tool] Enviar Mensagem Picada Chatwoot** (Nodes 3.7.1.1, 3.7.2.1, 3.7.3.1) - 6 nodes v1.0

#### **Gatilhos**
- **Webhook Chatwoot:** `message_created` (tempo real)

#### **Tabelas do Banco**
- **Leitura:** `conversas_chatwoot`, `mensagens_chatwoot`, `alunos`, `progresso_alunos`, `snapshots_alunos_campanhas`, `tags_disponiveis`
- **Escrita:** `mensagens_chatwoot` (**7 pontos de registro** - v1.8a), `conversas_chatwoot` (resumos + tags), `alunos` (tags_objetivos[], tags_conquistas[] - **Tags Soberanas**)

#### **Integrações Externas**
- OpenAI GPT-4.5-nano (respostas IA conversacionais)
- OpenAI Whisper (transcrição de áudios)
- OpenAI Vision GPT-4o-mini (análise de imagens)
- Google Gemini 2.5 Flash Lite (Supervisor IA - tags + decisões + resumos)
- Chatwoot API (envio de respostas + Labels API para espelhamento de tags)

#### **Sistema de Memória Hierárquica (3 Camadas)**
- **Contexto Histórico** (long-term) - Últimas 5 conversas resolvidas, condensado por IA (~1000 chars total, ~200 chars/conversa)
- **Resumo Evolutivo** (working memory) - Conversa atual em andamento, atualizado a cada mensagem (~500 tokens)
- **Resumo Final** (consolidated) - Snapshot estruturado ao resolver conversa (formato PROBLEMA|SOLUCAO|RESULTADO|TOM)

#### **Sistema de Tags v2.2 - Tags Soberanas**
- **20 Tags Totais:** 10 objetivos + 10 conquistas
- **Detecção Automática:** Supervisor IA (Gemini 2.5 Flash) analisa conversa em Node 3.6.5
- **Aplicação Paralela:** Sub-Bloco 3.7.4 (4 nodes) - não bloqueia resposta ao aluno
- **Arquitetura Soberana:**
  - **Supabase = Source of Truth:** Arrays PostgreSQL (`tags_objetivos[]`, `tags_conquistas[]`) com GIN indexes
  - **Chatwoot = Read-only Mirror:** Labels API espelha tags para visualização (sincronização bidirecional)

#### **Audit Trail - 7 Pontos de Registro (v1.8a - 01/11/2025)**
Todas as mensagens registradas via **Tool Registrar Mensagem Chatwoot (v1.4)**:

**INCOMING (4 pontos):**
1. Node 3.7.1.1.5: Mensagem Cliente → Bot (Reply)
2. Node 3.7.2.1.5: Mensagem Cliente → Bot (Handoff)
3. Node 3.7.3.1.5: Mensagem Cliente → Bot (Resolve)
4. Node 2.2.1.1.5: Mensagem Cliente → Humano

**OUTGOING (3 pontos):**
5. Node 3.7.1.1.6: Mensagem Bot → Cliente (Reply) ← NOVO! 01/11/2025
6. Node 3.7.2.1.6: Mensagem Bot → Cliente (Handoff) ← NOVO! 01/11/2025
7. Node 3.7.3.1.6: Mensagem Bot → Cliente (Resolve) ← NOVO! 01/11/2025
8. Node 1.4.2.1: Mensagem Humano → Cliente

**ARQUITETURA ANTI-SOBRECARGA (v1.8a):**
- Nodes 3.7.x.1.6 registram mensagem COMPLETA (`Router Actions.customer_response_text`)
- Registro acontece ANTES de Tool Enviar Mensagem Picada quebrar em 4-6 mensagens curtas
- Benefício: 1 registro no banco vs 4-6 registros redundantes (evita sobrecarga de webhooks)
- ~~REMOVIDO Node 1.4.2.2 (Bot OUT no Sub-Bloco 1.1)~~ - Estratégia obsoleta desde 01/11/2025

#### **Router Actions (2 Ações Detectadas pela IA)** ⚠️ v2.0.3
1. **Reply** - Responder normalmente (bot continua atendendo)
2. **Handoff** - Transferir para humano (bot atribui conversa para agente ADM ID 2)

**⚠️ MUDANÇA v2.0.3 (10/11/2025):**
- **Removido:** Route 3 (Resolve) - bot não pode mais finalizar conversas automaticamente
- **Sub-Bloco 3.7.3:** Desconectado mas preservado para uso futuro
- **Controle:** Apenas agentes humanos podem marcar conversas como resolvidas
- **Despedidas:** Bot responde normalmente (reply) mas não finaliza
- **Resumo final:** Gerado exclusivamente pelo Workflow Status Changed quando humano resolver

---

### 3. [CS] Chatwoot - Status Changed

**Arquivo:** `/workflows/[CS] Chatwoot - Status Changed.md` (363 linhas)  
**Versão Atual:** v1.1  
**Status:** ✅ 100% IMPLEMENTADO  
**Data de Conclusão:** 30 de Outubro de 2025

#### **Objetivo**
Finalizar conversas de forma estruturada quando status muda para `resolved`, gerando resumo final via IA e preparando contexto_historico condensado para próximas conversas.

#### **Estrutura (6 Nodes)**

| Node | Função Principal |
|------|------------------|
| **1. Webhook** | Receber evento `conversation.status_changed` do Chatwoot |
| **2. Validação Status** | IF status = 'resolved' (ignorar se open/pending/snoozed) |
| **3. Buscar Conversa** | PostgreSQL: SELECT conversa_id, resumo_evolutivo WHERE data_resolucao IS NULL |
| **4. Idempotência Check** | WHERE data_resolucao IS NULL garante processamento único |
| **4.5. Tool Gerar Resumo Final** | Chamar Tool - Gemini 2.5 Flash gera resumo estruturado (Node adicionado v1.1) |
| **5. Salvar no Banco** | UPDATE conversas_chatwoot: resumo_final, data_resolucao, status_conversa |

#### **Ferramentas Utilizadas**
- **[tool] Gerar Resumo Final** (Node 4.5) - 5 nodes v1.0

#### **Gatilhos**
- **Webhook Chatwoot:** `conversation.status_changed` (quando status muda para resolved)

#### **Tabelas do Banco**
- **Leitura:** `conversas_chatwoot` (resumo_evolutivo, data_resolucao para idempotência)
- **Escrita:** `conversas_chatwoot` (resumo_final, data_resolucao, status_conversa)

#### **Integrações Externas**
- Google Gemini 2.5 Flash (geração de resumo final estruturado)

#### **Sistema de Resumos IA - COALESCE 3 Níveis (Robustez)**
Node 4.5 usa fallback estratégico para garantir resumo SEMPRE presente:
```sql
COALESCE(
  resumo_gerado_pela_ia,           -- Prioridade 1: Resumo estruturado pela Tool
  resumo_evolutivo,                -- Prioridade 2: Working memory da conversa
  'Conversa finalizada sem resumo' -- Prioridade 3: Fallback garantido
) AS resumo_final
```

#### **Formato do Resumo Final (Estruturado)**
```
PROBLEMA: Aluno não conseguiu acessar módulo 3
SOLUCAO: Verificado login, enviado link alternativo de acesso
RESULTADO: Aluno acessou com sucesso, assistiu 2 aulas
TOM: Resolvido com sucesso, aluno satisfeito
```

#### **Características v1.1**
- ✅ **Idempotência:** WHERE `data_resolucao IS NULL` previne reprocessamento
- ✅ **Performance:** ~300ms por execução (incluindo chamada Gemini)
- ✅ **Custo:** ~R$ 0,0011 por resumo gerado
- ✅ **Testado em produção:** conversation_id 15 e 18 (30/10/2025)
- ✅ **Separação de responsabilidades:** Central processa mensagens, Status Changed finaliza conversas

---

### 4. [CS] Sync_Sheets_Config

**Arquivo:** `/workflows/[CS] Sync_Sheets_Config.md` (287 linhas)  
**Versão Atual:** v1.2  
**Status:** ✅ 100% IMPLEMENTADO  
**Data de Conclusão:** 29 de Outubro de 2025

#### **Objetivo**
Sincronizar diariamente a lista de trilhas do Supabase para o Google Sheets, alimentando dropdown "Semana em Foco" usado pelo operador na aba CONTROLE.

#### **Estrutura (4 Nodes)**

| Node | Função Principal |
|------|------------------|
| **1. Trigger** | Schedule Trigger (diário 3:00 AM) + Manual Trigger (Menu Google Sheets) |
| **2. SQL Query** | SELECT nome_trilha, id FROM trilhas ORDER BY ordem ASC |
| **3. Clear Sheet** | Limpar aba `_config_trilhas` mantendo primeira linha (headers) |
| **4. Append Rows** | Inserir trilhas ordenadas (mapping automático por nome de coluna) |

#### **Ferramentas Utilizadas**
- Nenhuma (workflow independente)

#### **Gatilhos**
- **Automático:** Schedule Trigger diário às 03:00 AM (horário de baixa carga)
- **Manual:** Menu Google Sheets → 🚀 Automações CS → 🔄 Sincronizar Trilhas (v1.2)

#### **Tabelas do Banco**
- **Leitura:** `trilhas` (nome_trilha, id, ordem)
- **Escrita:** Nenhuma (apenas leitura do banco)

#### **Planilhas Google Sheets**
- **Aba `_config_trilhas`** (oculta) na planilha `Bruno_Lucarelli_Base`
  - Coluna A: `nome_trilha` (ex: "Semana 1 - Fundamentos")
  - Coluna B: `id_trilha` (UUID do banco)
  - Usado por dropdown na aba CONTROLE (célula A2)

#### **Integrações Externas**
- Google Sheets API (escrita em aba oculta)
- N8N Webhook (disparo manual via Menu Customizado v1.2)

#### **Performance**
- **Tempo de execução:** ~5 segundos total
- **Frequência:** 1x por dia (ou manual quando necessário)
- **Custo:** Gratuito (dentro da quota Google Sheets API)

#### **Impacto na Integração Chatwoot**
- ✅ **NENHUM IMPACTO DIRETO**
- Workflow permanece 100% inalterado após Chatwoot
- Não interage com tabelas de conversas ou mensagens
- Função: sincronizar configurações (não relacionado a atendimento)

#### **Melhorias v1.2 (29/10/2025)**
- ✅ Adicionado disparo manual via Menu Customizado (Google Apps Script)
- ✅ Webhook `/webhook/cs/sync-sheets/manual` com autenticação API Key
- ✅ Operador pode sincronizar sob demanda (não precisa esperar 3:00 AM)

---

### 5. [CS] Sync_External_Data

**Arquivo:** `/workflows/[CS] Sync_External_Data_V1.md`  
**Versão Atual:** v3.1  
**Status:** ✅ 100% IMPLEMENTADO  
**Data de Conclusão:** 03 de Novembro de 2025 (v3.1)

#### **Objetivo**
Receber webhooks da plataforma Cademi com atualizações de progresso dos alunos e sincronizar automaticamente:
1. Tabela `progresso_alunos` (percentual de progresso)
2. Tabela `alunos.data_ultimo_acesso` (timestamp do último acesso) - **v3.1**
3. Tabela `webhook_logs` (auditoria de erros) - **v3.1**

#### **Estratégia de Sincronização**
- ✅ **Cadastro Manual:** Alunos e trilhas criados manualmente via dashboard (Supabase/Google Sheets)
- ✅ **Progresso Automático:** Webhook Cademi atualiza `progresso_alunos.percentual_progresso`
- ✅ **Último Acesso Automático:** Atualiza `alunos.data_ultimo_acesso` (v3.1)
- ✅ **Auditoria de Erros:** Registra webhooks inválidos em `webhook_logs` (v3.1)
- ❌ **Sem criação automática:** Alunos/trilhas não encontrados retornam 200 OK com `status: "ignored"`

#### **Estrutura (9 Nodes)**

| Node | Função Principal |
|------|------------------|
| **1. Webhook** | Receber POST do Cademi (`/webhook/cademi-progresso`) |
| **2. Validar Payload** | IF (event_type AND usuario.id AND produto.id) THEN prosseguir ELSE 400 Bad Request |
| **3. CROSS JOIN Query** | Buscar `aluno_id + trilha_id` em 1 query otimizada (vs 2 separadas) |
| **4. Validar Dados** | IF (aluno found AND trilha found) THEN atualizar ELSE 200 OK "ignored" |
| **5. CTE Atômico** | UPSERT `progresso_alunos` + UPDATE `alunos.data_ultimo_acesso` (v3.1) |
| **6. Sucesso** | 200 OK + `{status: "success", aluno_id, trilha_id, progresso}` |
| **7. Ignorado** | 200 OK + `{status: "ignored", motivo: "aluno não encontrado"}` |
| **8. Erro 400** | 400 Bad Request + `{status: "error", campos obrigatórios}` |
| **9. Registrar Erro** | INSERT em `webhook_logs` (auditoria de erros 400) - **v3.1** |

#### **Otimizações v3.1**

**1. CROSS JOIN (50% menos I/O)**
```sql
SELECT 
  a.id AS aluno_id,
  t.id AS trilha_id
FROM alunos a
CROSS JOIN trilhas t
WHERE a.id_externo = $1 AND t.id_externo = $2
```
- **Vantagem:** 1 query vs 2 queries separadas (economia de 50% I/O)
- **Performance:** ~150ms por requisição

**2. CTE Atômico (v3.1) - Atualiza 2 tabelas em 1 transação**
```sql
WITH progresso_update AS (
  INSERT INTO progresso_alunos (...)
  ON CONFLICT (...) DO UPDATE ...
  RETURNING *
)
UPDATE alunos 
SET data_ultimo_acesso = $4::timestamp
WHERE id = $1::uuid
RETURNING (SELECT * FROM progresso_update);
```
- **Vantagem:** Garantia de atomicidade (progresso + último acesso sempre sincronizados)
- **Performance:** ~200ms por requisição

#### **HTTP Semantics Corretas**
- ✅ **200 OK:** Payload válido (mesmo se aluno não encontrado)
- ✅ **400 Bad Request:** Payload inválido (faltando campos obrigatórios)
- ❌ **404 Not Found:** NÃO usado (Cademi enviou dados corretos, só não existem no DB)

**Lógica:** Se Cademi enviou email/progresso/trilha válidos, ele fez a parte dele corretamente → 200 OK com `status: "ignored"`. Erro 400 apenas se payload malformado.

#### **Testes Validados (4 Cenários - v3.1)**

| Teste | Payload | Resultado | Tempo | Status |
|-------|---------|-----------|-------|--------|
| **1. Sucesso** | Andy Camargo + Missão 03 + 32.4% | 200 OK, progresso + último acesso atualizados | 1.54s | ✅ |
| **2. Ignored** | Marcos José (não existe) | 200 OK, `status: "ignored"` | 914ms | ✅ |
| **3. Error** | `{"invalid": "data"}` | 400 Bad Request, erro detalhado | 806ms | ✅ |
| **4. Webhook Logs** | Payload inválido | Registrado em `webhook_logs` com payload completo | ~50ms | ✅ |

#### **Exemplo de Payload Cademi**
```json
{
  "email": "andyc@gmail.com",
  "progress": 32.4,
  "trilha_name": "Missão 03 - Conquistar Confiança"
}
```

#### **Ferramentas Utilizadas**
- Nenhuma (workflow standalone)

#### **Gatilhos**
- **Webhook Externo:** `POST https://wbhooks.tcsbrunolucarelli.uk/webhook/cademi-progresso`
- Disparado pela plataforma Cademi a cada atualização de progresso

#### **Tabelas do Banco**
- **Leitura:** `alunos` (email), `trilhas` (nome_trilha)
- **Escrita:** `progresso_alunos` (UPSERT media_trilha_atual, data_atualizacao)

#### **Integrações Externas**
- Plataforma Cademi (origem do webhook)

#### **Vantagens da v3.1**
- ✅ **Simplicidade:** 9 nodes vs 27 planejados inicialmente (67% redução)
- ✅ **Performance:** CROSS JOIN (1 query vs 2) + CTE atômico
- ✅ **Segurança:** Validação de payload antes de query
- ✅ **Confiabilidade:** HTTP semantics corretas (200 OK não significa erro no Cademi)
- ✅ **Manutenibilidade:** Lógica clara e direta (sem complexidade desnecessária)
- ✅ **Auditoria:** Todos erros 400 registrados em `webhook_logs` com payload completo (v3.1)
- ✅ **Sincronização completa:** Progresso + último acesso em 1 transação atômica (v3.1)

#### **Diferença vs Versão Descontinuada**
- **V1.0 (27 nodes - DESCONTINUADO):** Tentava criar alunos/trilhas automaticamente
- **V3.0 (7 nodes - PRODUÇÃO):** Apenas atualiza progresso, cadastro é manual

**Arquivo:** `/proximos-passos/[CS] Sync_External_Data.md` (versão descontinuada)  
**Arquivo Atual:** `/workflows/[CS] Sync_External_Data_V1.md` (v3.0 FINAL)

---

### 6. [CS] Send_Broadcast

**Arquivo:** `/proximos-passos/[CS] Send_Broadcast.md` (especificação completa, 847 linhas)  
**Versão Atual:** v1.0 (Especificação)  
**Status:** � MOVIDO PARA PRÓXIMOS PASSOS (Pós-MVP)  
**Prioridade:** MÉDIA - Nice-to-have (funcionalidade substituída por Run_Campaign)

#### **Objetivo**
Enviar mensagens WhatsApp broadcast manuais para segmentos customizados de alunos, SEM classificação automática de funis. Operador escolhe template e filtros manualmente.

#### **Estrutura Planejada (12 Nodes)**

| Bloco | Nodes | Função Principal |
|-------|-------|------------------|
| **1. Setup e Validação** | 1-4 | Webhook manual, Buscar template, Buscar alunos com filtros, Atualizar planilha "Enviando..." |
| **2. Envio e Logs** | 5-7 | Loop sobre alunos, **Enviar WhatsApp** (HTTP Request), Registrar log (origem='broadcast') |
| **3. Finalização** | 8-9 | Contar sucessos/erros (JavaScript), Atualizar planilha final (status + contador) |

#### **Ferramentas Planejadas**
- **[tool] Enviar WhatsApp + Chatwoot** - Reutilizar do Run_Campaign (após adaptação)

#### **Gatilhos**
- **Manual:** Webhook via Google Sheets (operador preenche form + clica botão DISPARAR)

#### **Tabelas do Banco**
- **Leitura:** `templates`, `alunos`, `progresso_alunos`, `trilhas`
- **Escrita:** `logs_envios` (com coluna `origem='broadcast'`)

#### **Planilhas Google Sheets**
- **Nova aba:** "Disparos Manuais" (10 colunas)
  - Template (dropdown), Filtro Trilha, Filtro Dias Inativo, Filtro Progresso Min/Max
  - Preview Alunos ("247 alunos serão impactados")
  - Status auto ("Pronto" → "Enviando..." → "✅ Concluído")
  - Total Enviado ("245/247"), Último Envio (timestamp)
  - Botão DISPARAR (Apps Script)

#### **Diferenças vs Run_Campaign**

| Aspecto | Run_Campaign | Send_Broadcast |
|---------|--------------|----------------|
| **Disparo** | Automático (timer) | Manual (operador) |
| **Classificação Funis** | ✅ Dual (global + trilha) | ❌ Nenhuma |
| **Template** | 🤖 Automático (baseado em funil) | 👤 Manual (operador escolhe) |
| **Filtros Alunos** | Fixo (trilha da campanha) | Customizável (trilha, dias, progresso) |
| **BI Snapshots** | ✅ Cria snapshots_alunos_campanhas | ❌ Não cria |
| **Registro Campanha** | ✅ Tabela `campanhas` | ❌ Não registra |
| **Logs** | `origem='campaign'` | `origem='broadcast'` |
| **Complexidade** | 22 nodes | 12 nodes (simplificado) |

#### **Casos de Uso**
- ✅ "Enviar boas-vindas para TODOS os alunos (universal)"
- ✅ "Enviar aviso urgente: Live hoje às 20h"
- ✅ "Enviar pesquisa de satisfação para alunos >50% progresso"
- ✅ "Enviar promoção Black Friday para inativos >30 dias"
- ✅ "Enviar re-engajamento para trilha específica"

#### **Alterações no Banco de Dados Necessárias**
```sql
-- Flag: quais templates disponíveis para broadcast
ALTER TABLE templates 
ADD COLUMN disponivel_broadcast BOOLEAN DEFAULT true;

-- Rastrear origem do envio (campaign vs broadcast)
ALTER TABLE logs_envios 
ADD COLUMN origem VARCHAR(20) DEFAULT 'campaign';
```

#### **Vantagem Estratégica**
- ⚡ **Será criado APÓS integração Chatwoot completa**
- ⚡ **Nasce com arquitetura correta desde o início** (sem retrabalho)
- ⚡ **Logs bidirecionais automáticos** (WhatsApp + Chatwoot)
- ⚡ **Conversas Chatwoot criadas automaticamente**

#### **Estimativa de Implementação**
- **Tempo:** 4-5 dias de desenvolvimento focado
- **Reuso de código:** ~40% do Run_Campaign (loops, envio, logs)
- **Não bloqueia MVP:** Run_Campaign substitui funcionalidade básica

---

## 🛠️ TOOLS (Ferramentas Reutilizáveis)

### Resumo das 8 Tools Implementadas

| Tool | Nodes | Versão | Status | Usada Por | Função Principal |
|------|-------|--------|--------|-----------|------------------|
| **Buscar Dossier CS** | 3 | v1.1 | ✅ 100% | Chatwoot Central | Buscar snapshot de funis + progresso via SQL function otimizada |
| **Processamento de Mensagens** | 16 | v1.0 | ✅ 100% | Chatwoot Central | Whisper (áudio) + Vision (imagem) + debounce 7 nodes (DISABLED) |
| **Gerar Resumo Evolutivo** | 4 | v1.0 | ✅ 100% | Chatwoot Central | Gemini 2.5 Flash - Working memory (~500 tokens) |
| **Condensar Resumo Historico** | 6 | v2.0 | ✅ 100% | Chatwoot Central | Comprimir contexto histórico (~200 chars/conversa) |
| **Gerar Resumo Final** | 5 | v1.0 | ✅ 100% | Status Changed | Gemini 2.5 Flash - Snapshot estruturado (PROBLEMA\|SOLUCAO\|RESULTADO\|TOM) |
| **Registrar Mensagem Chatwoot** | 4 | v1.4 | ✅ 100% | Chatwoot Central (6 pontos) | Audit trail completo de mensagens (IA + humano) |
| **Enviar WhatsApp + Chatwoot** | 21 | v1.2 | ✅ 100% | Run_Campaign | Envio atômico WhatsApp + espelhamento Chatwoot + logs bidirecionais |
| **Enviar Mensagem Picada Chatwoot** | 6 | v1.1 | ✅ 100% | Chatwoot Central (Node 3.7.1.1) | Humanizar mensagens IA (quebra inteligente ! ? . \n\n + delay dinâmico 0.5-5s) |

### Detalhamento das Tools

#### 1. [tool] Buscar Dossier CS (3 nodes, v1.1)

**Função:** Buscar contexto completo do aluno via SQL function otimizada `buscar_dossie_cs(aluno_id)`

**Estrutura:**
- Node 1: Receber aluno_id (input)
- Node 2: Executar SQL function (retorna funil_global, funil_trilha, progresso, tags)
- Node 3: Formatar output JSON

**Performance:** ~35ms (~30ms SQL + ~5ms formatting) - 10x mais rápida que v2.0

**Mudança Crítica v1.1:** Agora lê classificação de `snapshots_alunos_campanhas` (não recalcula)

**Dependência:** Run_Campaign deve rodar ANTES para popular snapshots (Single Source of Truth)

**Output Exemplo:**
```json
{
  "aluno_id": "uuid",
  "nome": "João Silva",
  "funil_global": "Engajado Geral",
  "funil_trilha": "Engajado Trilha",
  "progresso_trilha_atual": 65,
  "tags_objetivos": ["objetivo-arrematar", "objetivo-investimento"],
  "tags_conquistas": ["concluiu-modulo-1"]
}
```

---

#### 2. [tool] Processamento de Mensagens (16 nodes, v1.0)

**Função:** Processar mensagens multimodais (texto/áudio/imagem) e textualizar para IA

**Estrutura:**
- Nodes 1-3: Identificar tipo de mensagem (Switch: text/audio/image)
- Nodes 4-6: Processar áudio (OpenAI Whisper API)
- Nodes 7-9: Processar imagem (OpenAI Vision GPT-4o-mini)
- Nodes 10-16: **Sistema de Debounce** (7 nodes Redis) - **DESABILITADO temporariamente**

**Sistema de Debounce (DISABLED):**
- Node 10: Salvar mensagem user (Redis Push)
- Node 11: Memory 1 (Redis Get)
- Node 12: Espera de MSG1 (Wait 20s) - **DESABILITADO**
- Node 13: Memory 2 (Redis Get)
- Node 14: Combinar conteúdo msgs (Code JavaScript)
- Node 15: Comparar as MSGs (Switch: Continuar/Parar)
- Node 16: Excluir MSG (Redis Delete)

**Por que Debounce está DESABILITADO:**
- Aumentava latência em 20s+ (má UX)
- Alunos não enviam múltiplas mensagens seguidas com frequência
- Benefício < custo de espera

**APIs Utilizadas:**
- OpenAI Whisper: R$ 0,006/minuto de áudio
- OpenAI Vision: R$ 0,01/imagem

---

#### 3. [tool] Gerar Resumo Evolutivo (4 nodes, v1.0)

**Função:** Atualizar resumo da conversa atual a CADA mensagem (working memory)

**Estrutura:**
- Node 1: Receber conversa_id + nova mensagem
- Node 2: Buscar resumo_evolutivo anterior do banco
- Node 3: Chamar Gemini 2.5 Flash (resumo anterior + nova msg → novo resumo)
- Node 4: UPDATE conversas_chatwoot SET resumo_evolutivo, data_ultima_interacao

**Prompt para Gemini:**
```
Resumo anterior: [resumo atual ou vazio]
Nova mensagem: [conteúdo]

Atualize o resumo mantendo contexto relevante (~500 tokens).
```

**Performance:** ~200ms (chamada Gemini Flash)

**Custo:** ~R$ 0,0028 por 1k tokens (muito barato)

---

#### 4. [tool] Condensar Resumo Historico (6 nodes, v2.0)

**Função:** Comprimir contexto_historico quando >4000 tokens (economizar API costs)

**Estrutura:**
- Node 1: Receber conversa_id
- Node 2: Buscar últimas 5 conversas resolvidas
- Node 3: IF tokens >4000 → comprimir, ELSE → manter
- Node 4: Chamar Gemini 2.5 Flash (comprimir cada conversa para ~200 chars)
- Node 5: Formatar bullet list com datas
- Node 6: UPDATE conversas_chatwoot SET contexto_historico

**Output Exemplo:**
```
• 15/10/2025: Aluno perguntou sobre acesso módulo 3. Resolvido com link alternativo.
• 22/10/2025: Dúvida sobre leilão presencial vs online. Explicado diferenças.
• 28/10/2025: Solicitou certificado. Enviado via email após conclusão trilha 1.
```

**Economia:** ~85% redução de tokens (de ~5000 para ~750 tokens/conversa)

---

#### 5. [tool] Gerar Resumo Final (5 nodes, v1.0)

**Função:** Gerar resumo estruturado quando conversa é resolvida (snapshot consolidado)

**Estrutura:**
- Node 1: Receber conversa_id
- Node 2: Buscar resumo_evolutivo + mensagens da conversa
- Node 3: Chamar Gemini 2.5 Flash (gerar resumo estruturado)
- Node 4: Validar formato (PROBLEMA|SOLUCAO|RESULTADO|TOM)
- Node 5: Retornar resumo formatado

**Formato do Output:**
```
PROBLEMA: Aluno não conseguiu acessar módulo 3
SOLUCAO: Verificado login, enviado link alternativo de acesso
RESULTADO: Aluno acessou com sucesso, assistiu 2 aulas
TOM: Resolvido com sucesso, aluno satisfeito
```

**Usado por:** Workflow Status Changed (Node 4.5)

**Testado em produção:** conversation_id 15 e 18 (30/10/2025)

---

#### 6. [tool] Registrar Mensagem Chatwoot (4 nodes, v1.4)

**Função:** Registrar mensagens no audit trail (tabela `mensagens_chatwoot`)

**Estrutura:**
- Node 1: Receber inputs (conversa_id, conteúdo, tipo, agent_id)
- Node 2: Buscar conversa_id UUID via conversation_id_chatwoot
- Node 3: INSERT mensagens_chatwoot (8 campos)
- Node 4: Retornar confirmação

**Tabela mensagens_chatwoot v2.1 (SIMPLIFICADA - 8 campos):**
```sql
id UUID PRIMARY KEY
conversa_id UUID (FK)
message_id_chatwoot TEXT
conteudo TEXT (sempre textualizado)
tipo_mensagem VARCHAR(20) -- 'incoming' ou 'outgoing'
agent_id TEXT -- NULL=cliente, "3"=bot, outro=humano
is_agent BOOLEAN -- false=cliente, true=agente
data_envio TIMESTAMPTZ
```

**7 Pontos de Registro no Chatwoot Central (v1.8a - 01/11/2025):**

**INCOMING (4 pontos):**
1. Node 3.7.1.1.5: Mensagem Cliente → Bot (Reply)
2. Node 3.7.2.1.5: Mensagem Cliente → Bot (Handoff)
3. Node 3.7.3.1.5: Mensagem Cliente → Bot (Resolve)
4. Node 2.2.1.1.5: Mensagem Cliente → Humano

**OUTGOING (3 pontos):**
5. Node 3.7.1.1.6: Mensagem Bot → Cliente (Reply) ← NOVO! 01/11/2025
6. Node 3.7.2.1.6: Mensagem Bot → Cliente (Handoff) ← NOVO! 01/11/2025
7. Node 3.7.3.1.6: Mensagem Bot → Cliente (Resolve) ← NOVO! 01/11/2025
8. Node 1.4.2.1: Mensagem Humano → Cliente

**Arquitetura Anti-Sobrecarga:**
Nodes 3.7.x.1.6 registram mensagem COMPLETA antes de Tool Enviar Mensagem Picada quebrar em 4-6 mensagens.  
Benefício: 1 registro no banco vs 4-6 webhooks redundantes.

**Melhorias v1.4:**
- ✅ Simplificado de 9 para 8 campos (-11% complexidade)
- ✅ Conteúdo sempre textualizado (áudio/imagem convertidos)
- ✅ `is_agent` boolean (mais claro que `remetente_tipo`)
- ✅ Remoção de campo `anexos` (redundante com conteúdo textualizado)

**Arquivo:** `/workflows/[tool] Enviar WhatsApp + Chatwoot.md` (1255 linhas)  
**Versão:** v1.2  
**Status:** ✅ 100% COMPLETO (29/10/2025)

---

#### 8. [tool] Enviar Mensagem Picada Chatwoot (6 nodes, v1.1)

**Função:** Humanizar mensagens da IA quebrando em mensagens curtas sequenciais com delay dinâmico baseado no tamanho da próxima mensagem

**Estrutura:**
- Node 1: Execute Workflow Trigger (3 inputs: conversation_id, mensagem_completa, account_id)
- Node 2: Code - Quebrar Mensagem (lógica JavaScript inteligente + `calcularTempoEspera()`)
- Node 3: Loop Over Items (automático)
- Node 4: HTTP Request - Enviar Mensagem Chatwoot
- Node 5: Wait (dinâmico: 0.5-5s baseado no tamanho da próxima msg)
- Node 6: End Loop (automático)

**Lógica de Quebra Inteligente:**
1. Exclamações (!) → Quebra + preserva pontuação
2. Interrogações (?) → Quebra + preserva pontuação
3. Ponto final (.) → Quebra + **omite** pontuação (estilo WhatsApp casual)
4. Linha vazia (\n\n) → Quebra de parágrafo

**Delay Dinâmico (v1.1):**
- Fórmula: `tempo = Math.min(0.5 + (chars_proxima_msg × 0.08), 5.0)`
- Simula digitação humana real (~12.5 chars/segundo)
- Última mensagem: wait = 0 (não tem próxima)

**Exemplo:**
```
Input: "Ótimo, Tiago!\n\nFico feliz. Vamos em frente!"

Output:
  1. "Ótimo, Tiago!" → Wait 1.3s (tempo digitar msg 2)
  2. "Fico feliz" → Wait 2.1s (tempo digitar msg 3)
  3. "Vamos em frente!" → Wait 0s (última)
```

**Usado por:** Workflow Chatwoot Central (Nodes 3.7.1.1, 3.7.2.1, 3.7.3.1)

**Performance:**
- Média: ~4 mensagens por resposta IA
- Tempo total: ~8-15s (natural e humanizado)
- Typing indicator automático do Chatwoot
- Audit trail preserva mensagem completa (não picada)

**Testado em produção:** conversation_id 90 (01/11/2025) ✅

**Arquivo:** `/workflows/[tool] Enviar Mensagem Picada Chatwoot.md`  
**Versão:** v1.1  
**Status:** ✅ 100% OPERACIONAL (01/11/2025)

---

#### 7. [tool] Enviar WhatsApp + Chatwoot (27 nodes, v1.3)

#### **Fluxo Completo (27 Nodes)**
```
INPUT (aluno_id, trilha_id, template_id, campanha_id)
  ↓
Buscar Dados Completos (aluno + trilha + template)
  ↓
Preparar Dados + Validações (celular, primeiro nome, variáveis)
  ↓
IF: Contact ID Existe no Cache? → TRUE: usa cache | FALSE: criar contato
  ↓
Preparar Dados para Conversa
  ↓
Buscar Conversas Abertas (PostgreSQL)
  ↓
IF: Tem Conversa Aberta? → TRUE: fechar anterior | FALSE: pular
  ↓
Buscar Dados do Contato + Contexto Histórico (Sistema Memória)
  ↓
Criar Conversa no Chatwoot (HTTP Request)
  ↓
Enviar WhatsApp Template (WhatsApp Business Cloud)
  ↓
IF: Mensagem Aceita?
  ├─ TRUE: Registrar Sucesso (CTE: 3 tabelas atômicas) → Espelhar no Chatwoot
  └─ FALSE: Registrar Erro → Fechar Conversa → Nota Privada (erro detalhado)
  ↓
Consolidar Output Padronizado (JSON)
  ↓
OUTPUT (status, whatsapp, chatwoot, auditoria, aluno)
```

#### **Funcionalidades v1.2**
- ✅ Cache bidirecional de `contact_id_chatwoot` (OUTGOING + INCOMING)
- ✅ Sistema de Memória Hierárquica (contexto histórico)
- ✅ Registro atômico (3 tabelas em 1 transação)
- ✅ Tratamento de erro com cleanup (Nodes 13a-13b)
- ✅ Output padronizado (Node 15)

#### **Tabelas Atualizadas**
1. `conversas_chatwoot` - Nova conversa criada
2. `mensagens_chatwoot` - Mensagem registrada
3. `logs_envios` - Auditoria completa (sucesso ou falha)

---

## 📊 MÉTRICAS E MONITORAMENTO

### Métricas por Workflow

| Workflow | Métrica Principal | Valor Esperado | Como Monitorar |
|----------|-------------------|----------------|----------------|
| **Run_Campaign** | Taxa de sucesso | >98% | `logs_envios` (status = 'sucesso') |
| **Chatwoot Central** | Tempo de resposta | <3s | Timestamp entre mensagem cliente e resposta bot |
| **Status Changed** | Resumos gerados | 100% | COUNT(resumo_final IS NOT NULL) |
| **Sync Sheets** | Sincronizações bem-sucedidas | 100% | Logs de execução diária |

### Alertas Recomendados (Ainda Não Implementados)

| Alerta | Condição | Canal | Prioridade |
|--------|----------|-------|------------|
| **Taxa de falha >5%** | logs_envios falhas >5% | Discord RED ALERT | 🔥🔥 |
| **Tempo resposta IA >10s** | GPT-4.5 timeout | Discord WARNING | 🟡 |
| **Sync Sheets falhou** | Última execução >25h | Discord WARN | 🟡 |
| **WhatsApp API erro 429** | Rate limit atingido | Discord RED + Email | 🔥🔥🔥 |

---

## 🔄 INTEGRAÇÕES EXTERNAS

### APIs Utilizadas

| Serviço | Workflow | Função | Custo Estimado |
|---------|----------|--------|----------------|
| **Meta WhatsApp Business API** | Run_Campaign, Tool Enviar WhatsApp | Envio de templates | R$ 0,07/msg |
| **OpenAI GPT-4.5-nano** | Chatwoot Central | Respostas IA | R$ 0,015/1k tokens |
| **OpenAI Whisper** | Tool Processamento MSG | Transcrição áudios | R$ 0,006/minuto |
| **OpenAI Vision** | Tool Processamento MSG | Análise imagens | R$ 0,01/imagem |
| **Google Gemini 2.5 Flash** | Tools Resumo Evolutivo/Final | Resumos estruturados | R$ 0,0028/1k tokens |
| **Chatwoot API** | Todos workflows | Gestão conversas | Grátis (self-hosted) |
| **Google Sheets API** | Run_Campaign, Sync Sheets | Controle operacional | Grátis (quota OK) |

### Estimativa de Custos Mensais (800 alunos)

```
FIXOS:
- Supabase Pro: R$ 120
- N8N Cloud/VPS: R$ 200
Total Fixo: R$ 320

VARIÁVEIS (10.000 conversas/mês):
- WhatsApp: R$ 700 (10k templates × R$ 0,07)
- OpenAI (GPT + Whisper + Vision): R$ 230
- Gemini: R$ 28
Total Variável: R$ 958

TOTAL ESTIMADO: R$ 1.278/mês
```

---

## 🗄️ TABELAS DO BANCO DE DADOS

### Tabelas Principais (13 tabelas)

| Tabela | Uso | Workflows que Escrevem | Tamanho Estimado |
|--------|-----|------------------------|------------------|
| **alunos** | Cadastro de alunos | Sync Sheets, Tool Enviar WhatsApp (cache) | ~1k linhas |
| **trilhas** | Estrutura do curso | Sync Sheets | ~10 linhas |
| **progresso_alunos** | Progresso por trilha | (externo - importado) | ~4k linhas |
| **templates** | Templates WhatsApp | Sync Sheets | ~30 linhas |
| **funis_globais** | Classificação global (5) | Sync Sheets | 5 linhas |
| **funis_especificos** | Classificação trilha (2) | Sync Sheets | 2 linhas |
| **campanhas** | Histórico de campanhas | Run_Campaign | ~100 linhas/ano |
| **snapshots_alunos_campanhas** | Snapshot de funis (BI) | Run_Campaign | ~80k linhas/ano |
| **logs_envios** | Auditoria de envios | Tool Enviar WhatsApp | ~80k linhas/ano |
| **conversas_chatwoot** | Conversas ativas | Chatwoot Central, Tool Enviar WhatsApp | ~10k linhas/ano |
| **mensagens_chatwoot** | Histórico de mensagens | Chatwoot Central, Tool Registrar MSG | ~100k linhas/ano |
| **tags_alunos** | Tags soberanas | Chatwoot Central (Router Actions) | ~5k linhas |

### Funções SQL Reutilizáveis

1. **`buscar_dossie_cs(aluno_id UUID)`** - Retorna funis + progresso (usada pela Tool Buscar Dossier)
2. **`get_tags_para_prompt(aluno_id UUID)`** - Retorna tags formatadas para prompt IA

---

## 🔐 SEGURANÇA E BOAS PRÁTICAS

### Credenciais N8N Configuradas

1. **Chatwoot_TG** (Header Auth) - API Chatwoot
2. **Pamela Santos | Arrematador** (WhatsApp Business Cloud) - Meta API
3. **db_bruno_lucarelli** (Postgres) - Supabase
4. **Google Sheets: titerceirizacs** (OAuth2) - Google API
5. **OpenAI_API** (API Key) - GPT-4.5 + Whisper + Vision
6. **Google_Gemini** (API Key) - Gemini 2.5 Flash

### Boas Práticas Implementadas

- ✅ **90% das queries** usam parâmetros preparados (segurança SQL injection)
- ✅ **Índices estratégicos** em todas as foreign keys (performance)
- ✅ **RETURNING \*** em INSERTs (capturar IDs gerados)
- ✅ **CTEs** para legibilidade de queries complexas
- ✅ **Versionamento de workflows** (histórico rastreável)

### Vulnerabilidades Conhecidas (Pendente Correção)

- 🟡 **2 queries** ainda usam interpolação direta (10% do total)
- 🟡 Ver `AUDITORIA_SQL_INJECTION.md` para detalhes

---

## 📚 DOCUMENTAÇÃO RELACIONADA

### Hierarquia de Documentos

```
📁 Terceiriza CS/
│
├─ 📄 README.md - Visão geral + status + setup rápido
│
├─ 📁 docs/
│  ├─ 📄 FLUXO_DE_TRABALHO.md - Fluxo de negócio (visão operacional)
│  ├─ 📄 RESUMO_WORKFLOWS.md - Este documento (visão técnica consolidada)
│  ├─ 📄 MAPA_DE_DEPENDENCIAS.md - Relacionamentos entre componentes
│  ├─ 📄 TABELAS.md - Estrutura completa do banco (DDL + índices)
│  ├─ 📄 LOGICA_DE_FUNIS.md - Classificação dual de alunos
│  ├─ 📄 MENU_CUSTOMIZADO.md - Menu Google Sheets (operador)
│  ├─ 📄 PLANILHAS.md - Estrutura das abas Google Sheets
│  └─ 📄 RELATORIO_ANALISE_CRITICA.md - Análise técnica do projeto
│
├─ 📁 workflows/
│  ├─ 📄 [CS] Run_Campaign.md (1764 linhas) - Specs completas
│  ├─ 📄 [CS] Chatwoot - Central.md - Specs completas
│  ├─ 📄 [CS] Chatwoot - Status Changed.md - Specs completas
│  ├─ 📄 [CS] Sync_Sheets_Config.md - Specs completas
│  ├─ 📄 [CS] Sync_External_Data_V1.md - Specs completas (v3.0 FINAL)
│  │
│  └─ 📁 Tools/
│     ├─ 📄 [tool] Buscar Dossier CS.md
│     ├─ 📄 [tool] Processamento de Mensagens.md
│     ├─ 📄 [tool] Gerar Resumo Evolutivo.md
│     ├─ 📄 [tool] Condensar Resumo Historico.md
│     ├─ 📄 [tool] Gerar Resumo Final.md
│     ├─ 📄 [tool] Registrar Mensagem Chatwoot.md
│     └─ 📄 [tool] Enviar WhatsApp + Chatwoot.md (1255 linhas)
│
├─ 📁 proximos-passos/
│  ├─ 📄 [CS] Send_Broadcast.md - Specs (pós-MVP)
│  └─ 📄 [CS] Sync_External_Data.md - v1.0 descontinuada (27 nodes)
│
├─ 📄 PLANO_DE_EXECUCAO.md - Roadmap + decisões (1720 linhas - REFATORAR)
├─ 📄 COMO_CONTEXTUALIZAR_NOVO_AGENTE.md - Onboarding (30 min)
└─ 📄 AUDITORIA_SQL_INJECTION.md - Segurança SQL
```

---

## 🎯 PRÓXIMOS PASSOS (Roadmap)

### Curto Prazo (Esta Semana)

1. ✅ **Auditar workflows restantes** - Chatwoot Central, Status Changed, Sync Sheets, Sync External Data
2. ✅ **Validar MAPA_DE_DEPENDENCIAS** - Cruzar com arquivos reais
3. ✅ **Sync_External_Data v3.0 implementado** - Webhook Cademi completo
4. 🔄 **Implementar alertas Discord** - Taxa de falha, erros críticos
5. 🔄 **Quebrar PLANO_DE_EXECUCAO.md** - 4 arquivos menores

### Médio Prazo (Próxima Semana)

6. 🔄 **Criar MANUAL_OPERADOR.md** - Guia para Pamela (não-técnico)
7. 🔄 **Criar TROUBLESHOOTING.md** - Top 10 erros + soluções
8. 🔄 **Corrigir SQL injection** - 2 queries pendentes
9. 🔄 **Documentar custos operacionais** - Planilha detalhada

### Longo Prazo (Pós-MVP)

10. 🔵 **Implementar Send_Broadcast** - Workflow nice-to-have
11. 🔵 **Testes de fumaça** - Smoke tests automatizados
12. 🔵 **Dashboard Supabase** - Métricas em tempo real
13. 🔵 **Disaster Recovery Plan** - Backups + restore procedures

---

## 📞 SUPORTE E CONTRIBUIÇÃO

### Mantenedores

- **Desenvolvedor Principal:** Tiago Gladstone
- **AI Assistant:** GitHub Copilot
- **Cliente:** Bruno Lucarelli (Pamela Santo como operadora)

### Como Contribuir

1. Ler `COMO_CONTEXTUALIZAR_NOVO_AGENTE.md` (onboarding 30 min)
2. Verificar `MAPA_DE_DEPENDENCIAS.md` (entender relacionamentos)
3. Consultar este documento para visão geral técnica
4. Ler specs completas em `/workflows/[nome-do-workflow].md`

---

**Documento criado em:** 30/10/2025  
**Baseado em:** Auditoria completa de workflows implementados  
**Última Atualização:** 03/11/2025 - Adicionado [CS] Sync_External_Data v3.0  
**Status:** ✅ VALIDADO E COMPLETO - MVP 100%

**Workflows Auditados:**
- ✅ Run_Campaign (22 nodes, 100%, 1764 linhas)
- ✅ Chatwoot Central (36 nodes, 100%, 2100+ linhas)
- ✅ Chatwoot Status Changed (6 nodes, 100%, 363 linhas)
- ✅ Sync_Sheets_Config (4 nodes, 100%, 287 linhas)
- ✅ Sync_External_Data (7 nodes, 100%, v3.0 FINAL) ← NOVO 03/11/2025

**Tools Auditadas (8/8 - 100%):**
- ✅ Buscar Dossier CS (3 nodes v1.1)
- ✅ Processamento Mensagens (16 nodes v1.0)
- ✅ Gerar Resumo Evolutivo (4 nodes v1.0)
- ✅ Condensar Resumo Historico (6 nodes v2.0)
- ✅ Gerar Resumo Final (5 nodes v1.0)
- ✅ Registrar Mensagem Chatwoot (4 nodes v1.4)
- ✅ Enviar WhatsApp + Chatwoot (27 nodes v1.3 - sistema dinâmico de parâmetros)
- ✅ Enviar Mensagem Picada Chatwoot (6 nodes v1.1)

**MVP Real:** 100% (5 de 5 workflows core operacionais + 8 tools completas)  
**Send_Broadcast:** Movido para pós-MVP (funcionalidade substituída por Run_Campaign)
