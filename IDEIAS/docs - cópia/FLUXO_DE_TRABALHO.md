# FLUXO DE TRABALHO - TerceirizaCS

**Versão:** 2.2 🚀  
**Data de Criação:** 14 de Outubro de 2025  
**Última Atualização:** [DATA ATUAL]  
**Status:** ✅ **MVP 100% COMPLETO** | ✅ **5 Workflows Core Operacionais** | ✅ **Database v2.8**

---

## 📜 HISTÓRICO DE VERSÕES

| Versão | Data | Mudanças | Status |
|--------|------|----------|--------|
| **2.2** | **[DATA ATUAL]** | **Banco v2.8 - Campo Ativo + Auto-Apelido:** Tabela alunos recebe campo ativo (BOOLEAN), trigger_atualizar_aluno_automatico implementado (auto-fill apelido + validação celular). Removido CHECK constraint check_celular_format. buscar_dossie_cs() v2.2 retorna campo ativo. Run_Campaign v4.2 filtra apenas alunos ativos (Node 3.1: AND ativo = true). Índice parcial idx_alunos_ativo criado. | **PRODUÇÃO** |
| **2.1** | **03/11/2025** | **[CS] Sync_External_Data v3.0 adicionado:** Webhook Cademi → Supabase completo (7 nodes). 5/5 workflows core operacionais. MVP 100%. Database v2.5 (trilhas.id UUID). Run_Campaign 100% implementado (22 nodes). | **PRODUÇÃO** |
| **2.0** | **30/10/2025** | **REESCRITA COMPLETA:** Reflete realidade operacional. 4/5 workflows implementados (80%). Sistema de Memória Hierárquica em produção. Tags v2.2 implementadas. Arquitetura modular com 7 tools. | **PRODUÇÃO** |
| 1.0 | 14/10/2025 | Documento inicial de planejamento (3 fases teóricas) | Obsoleto |

---

## 🎯 VISÃO GERAL DO SISTEMA

**TerceirizaCS** é um sistema de **Customer Success automatizado** que combina:

- 📊 **Classificação Inteligente** - Dual funnel (5 globais + 2 trilha)
- 📱 **Mensagens WhatsApp** - Templates personalizados via Meta API
- 🤖 **Chatbot AI** - GPT-4.5-nano + Gemini 2.5 Flash + Whisper + Vision
- 💬 **Central Chatwoot** - Bot automático + handoff humano
- 🧠 **Memória Hierárquica** - 3 camadas (contexto histórico + resumo evolutivo + resumo final)
- 🏷️ **Sistema de Tags v2.2** - 20 tags (10 objetivos + 10 conquistas) - Tags Soberanas
- 📈 **Business Intelligence** - Snapshots + analytics

---

## 🏗️ ARQUITETURA DO SISTEMA

### **Componentes Principais**

```
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE SHEETS                            │
│              (Interface Operacional)                        │
│   CONTROLE + ALUNOS_DASHBOARD + _config_trilhas            │
└─────────────────┬───────────────────────────────────────────┘
                  │ Webhook Manual Trigger
                  ↓
┌─────────────────────────────────────────────────────────────┐
│                      N8N WORKFLOWS                          │
├─────────────────────────────────────────────────────────────┤
│ MAIN WORKFLOWS (5):                                         │
│ • [CS] Run_Campaign ✅ (classificação + envio automatizado) │
│ • [CS] Chatwoot - Central ✅ (AI chatbot + Router Actions)  │
│ • [CS] Chatwoot - Status Changed ✅ (finalização conversa)  │
│ • [CS] Sync_Sheets_Config ✅ (sync trilhas → dropdown)     │
│ • [CS] Sync_External_Data ✅ (webhook Cademi → progresso)  │
├─────────────────────────────────────────────────────────────┤
│ TOOL WORKFLOWS (8):                                         │
│ • Buscar Dossier CS ✅                                      │
│ • Processamento de Mensagens ✅ (Whisper + Vision)         │
│ • Gerar e Salvar Resumo Evolutivo ✅                        │
│ • Condensar Resumo Historico ✅ (Gemini compression)       │
│ • Gerar Resumo Final ✅ (structured summary)               │
│ • Registrar Mensagem Chatwoot ✅                            │
│ • Enviar WhatsApp + Chatwoot ✅ (atomic messaging)         │
│ • Enviar Mensagem Picada Chatwoot ✅ (humanização)         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE POSTGRESQL v2.8                       │
│                  (12 Tabelas)                               │
├─────────────────────────────────────────────────────────────┤
│ CORE: alunos (tags), trilhas (UUID), progresso_alunos, templates │
│ FUNIS: funis_globais, funis_especificos                     │
│ OPERAÇÃO: campanhas, logs_envios, snapshots                │
│ CHATWOOT: conversas_chatwoot, mensagens_chatwoot           │
│ TAGS: tags_disponiveis (20 tags) ⭐                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              INTEGRAÇÕES EXTERNAS                           │
├─────────────────────────────────────────────────────────────┤
│ • WhatsApp Business API (Meta Cloud)                       │
│ • Chatwoot API (webhooks bidirecional)                     │
│ • OpenAI API (GPT-4.5-nano + Whisper + Vision)            │
│ • Google Gemini API (2.5 Flash - summaries)                │
│ • Google Sheets API (trigger manual + outputs)             │
│ • Cademi Webhooks (progresso_alunos sync)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 STATUS ATUAL (03/11/2025)

### **Implementação por Workflow**

| Workflow | Nodes | Status | Produção | Observações |
|----------|-------|--------|----------|-------------|
| **Run_Campaign** | 22 | ✅ 100% | ✅ Ativo | Sistema completo de campanhas |
| **Chatwoot Central** | 36 | ✅ 100% | ✅ Ativo | AI chatbot + Router Actions + Tags v2.2 |
| **Status Changed** | 6 | ✅ 100% | ✅ Ativo | Finalização estruturada |
| **Sync Sheets Config** | 4 | ✅ 100% | ✅ Ativo | Sync diário |
| **Sync External Data** | 7 | ✅ 100% | ✅ Ativo | Webhook Cademi → progresso |

### **Implementação por Tool**

| Tool | Nodes | Status | Usado Por |
|------|-------|--------|-----------|
| **Buscar Dossier CS** | 3 | ✅ 100% | Chatwoot Central |
| **Processamento MSG** | 16 | ✅ 100% | Chatwoot Central |
| **Gerar Resumo Evolutivo** | 4 | ✅ 100% | Chatwoot Central (3 branches) |
| **Condensar Resumo Historico** | 6 | ✅ 100% | Chatwoot Central |
| **Gerar Resumo Final** | 5 | ✅ 100% | Status Changed |
| **Registrar MSG Chatwoot** | 4 | ✅ 100% | Chatwoot Central (6 pontos) |
| **Enviar WhatsApp + Chatwoot** | 20 | ✅ 100% | Run_Campaign (aguarda integração) |

### **Resumo Executivo**

- ✅ **4 de 5 workflows principais** operacionais (80%)
- ✅ **7 de 7 tool workflows** implementadas (100%)
- ✅ **Sistema de Memória Hierárquica** em produção
- ✅ **Sistema de Tags v2.2** implementado (Tags Soberanas)
- ✅ **Banco v2.8** completo (13 tabelas + 2 funções SQL + 2 triggers)
- 🟡 **Run_Campaign** aguarda integração final da Tool

---

## 🔄 FLUXOS OPERACIONAIS

### **FLUXO 1: Campanha Automatizada (Run_Campaign)** 🟡 70%

**Trigger:** Manual via Google Sheets (checkbox CONTROLE.C2)

**Processo:**

```
OPERADOR marca checkbox
  ↓
Webhook → N8N Run_Campaign
  ↓
1. Criar registro campanha (status: processando)
  ↓
2. Buscar alunos ativos (ativo = true, celular válido via trigger)
  ↓
3. LOOP cada aluno:
   ├─ Calcular progresso_geral (média todas trilhas)
   ├─ Calcular progresso_trilha (média cumulativa)
   ├─ CLASSIFICAR Funil Global (5 tipos)
   ├─ CLASSIFICAR Funil Trilha (2 tipos - se aplicável)
   ├─ Buscar template correto (global ou específico)
   ├─ ⏳ Enviar WhatsApp + Espelhar Chatwoot (Tool)
   ├─ ⏳ Registrar em logs_envios
   └─ ⏳ Salvar snapshot (BI)
  ↓
4. ⏳ Finalizar campanha (status: concluído)
  ↓
5. ⏳ Escrever resultados em ALUNOS_DASHBOARD
```

**Status:** Nodes 1-4.5 implementados | **Nodes 4.6-5 pendentes**

**Bloqueio:** Tool "Enviar WhatsApp + Chatwoot" implementada mas aguarda integração no Node 4.6

---

### **FLUXO 2: Chatbot AI (Chatwoot Central)** ✅ 100%

**Trigger:** Webhook `message.created` do Chatwoot

**Processo:**

```
CLIENTE envia mensagem WhatsApp
  ↓
Chatwoot → Webhook → N8N
  ↓
BLOCO 1: RECEPÇÃO (4 nodes)
├─ Padronizar dados webhook
├─ Filtrar (só mensagens clientes)
├─ Switch: Bot ou Humano?
└─ [Se humano atende] → Registrar MSG + parar

BLOCO 2: IDENTIFICAÇÃO (11 nodes)
├─ Buscar aluno (por celular)
├─ UPSERT conversa Chatwoot (cria se não existe)
├─ UPDATE conversation_id em Supabase
└─ Validar dados

BLOCO 3: PROCESSAMENTO AI (19 nodes)
├─ 3.1: Buscar Dossier CS (Tool)
│      ↓ (progresso, funil, tags, memória hierárquica)
├─ 3.2: Get Tags para Prompt (SQL function)
├─ 3.3: Processamento de Mensagens (Tool)
│      ↓ (áudio→Whisper | imagem→Vision | texto)
├─ 3.4: Condensar Resumo Historico (Tool - se >400 chars)
├─ 3.5: Preparar Prompt (contexto completo)
├─ 3.6: AI AGENT (GPT-4.5-nano)
│      ├─ Sub-bloco 3.6.5: Supervisor IA (Gemini 2.5 Flash)
│      │    ↓ Detecta tags na conversa (objetivos + conquistas)
│      ├─ Sub-bloco 3.6.7: Calcular Tags Finais
│      ├─ Sub-bloco 3.6.8: UPDATE tags em alunos
│      └─ Sub-bloco 3.6.9: Sync labels Chatwoot
├─ 3.7: ROUTER ACTIONS (2 branches - v2.0.3)
│
│   ┌─ BRANCH 1: REPLY (AI responde)
│   │  ├─ Enviar resposta Chatwoot
│   │  ├─ Registrar Mensagem (Tool)
│   │  └─ Gerar/Salvar Resumo Evolutivo (Tool)
│   │
│   └─ BRANCH 2: HANDOFF (humano assume)
│      ├─ Enviar mensagem transição
│      ├─ Transferir para agente humano
│      ├─ Registrar Mensagem (Tool)
│      └─ Gerar/Salvar Resumo Evolutivo (Tool)
│
│   [BRANCH 3: RESOLVE - DESCONECTADO v2.0.3]
│   └─ Sub-Bloco 3.7.3 preservado mas não conectado
│      └─ Apenas humanos podem finalizar conversas
```

**Status:** ✅ **100% Implementado e em Produção**

**Destaques:**
- Sistema de Memória Hierárquica funcionando (3 camadas)
- Tags v2.2 implementadas (Supervisor IA + sync Chatwoot)
- Router Actions com 2 branches ativas (Reply/Handoff) + 1 desconectada (Resolve)
- 5 tools auxiliares integradas

---

### **FLUXO 3: Finalização de Conversa (Status Changed)** ✅ 100%

**Trigger:** Webhook `conversation.status_changed` do Chatwoot

**Processo:**

```
CONVERSA é resolvida (bot ou humano)
  ↓
Chatwoot → Webhook → N8N
  ↓
1. Buscar conversa no banco
  ↓
2. Gerar Resumo Final (Tool - Gemini 2.5 Flash)
   └─ Formato: PROBLEMA | SOLUCAO | RESULTADO | TOM
  ↓
3. UPDATE conversas_chatwoot
   ├─ status_conversa = 'resolved'
   ├─ resumo_final = [structured summary]
   ├─ data_resolucao = NOW()
   └─ COALESCE fallback (3 níveis)
```

**Status:** ✅ **100% Implementado e em Produção**

**Destaques:**
- Resumo final estruturado (PROBLEMA|SOLUCAO|RESULTADO|TOM)
- COALESCE com 3 níveis de fallback
- Gemini 2.5 Flash para condensação inteligente

---

### **FLUXO 4: Sync Config Trilhas (Daily)** ✅ 100%

**Trigger:** Schedule (1x/dia) + Manual (webhook)

**Processo:**

```
DAILY 00:00 UTC ou MANUAL
  ↓
1. SELECT trilhas (nome + ordem)
  ↓
2. Clear Google Sheets (_config_trilhas)
  ↓
3. Append trilhas atualizadas
  ↓
4. Dropdown CONTROLE.A2 atualizado
```

**Status:** ✅ **100% Implementado e em Produção**

---

### **FLUXO 5: Broadcast Manual (Send_Broadcast)** 🔴 0%

**Trigger:** Manual via Google Sheets (aba Disparos Manuais)

**Processo Planejado:**

```
OPERADOR seleciona:
├─ Template WhatsApp
├─ Lista de alunos (upload CSV)
└─ Horário de envio
  ↓
Webhook → N8N Send_Broadcast
  ↓
1. Validar template existe
2. Validar lista de alunos
3. LOOP cada aluno:
   ├─ Enviar WhatsApp + Chatwoot (Tool)
   └─ Registrar em logs_envios
4. Finalizar broadcast
5. Escrever resultados em Sheets
```

**Status:** 🔴 **0% Implementado** (Spec completa - 1.213 linhas)

**Prioridade:** Pós-MVP (não bloqueia produção)

---

## 🧠 SISTEMA DE MEMÓRIA HIERÁRQUICA

### **3 Camadas de Contexto**

```
┌─────────────────────────────────────────────────────────┐
│ NÍVEL 1: LONG-TERM MEMORY (contexto_historico)        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Últimas 5 conversas resolvidas (6 meses)              │
│ Formato: "• DD/MM/YYYY: [200 chars do resumo_final]" │
│ Fallback: "Primeira conversa com este cliente"       │
│ Tamanho: ~1000 chars                                  │
│ Update: Apenas INSERT (não UPDATE)                    │
└─────────────────────────────────────────────────────────┘
                    ↓ Incluso no Prompt IA
┌─────────────────────────────────────────────────────────┐
│ NÍVEL 2: WORKING MEMORY (resumo_evolutivo)            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Resumo da conversa ATUAL (evolutivo)                  │
│ Atualizado: CADA mensagem nova (Tool Resumo Evolutivo)│
│ Tamanho: ~500 tokens (cresce durante conversa)       │
│ Update: UPDATE mensagem a mensagem                    │
└─────────────────────────────────────────────────────────┘
                    ↓ Ao Resolver Conversa
┌─────────────────────────────────────────────────────────┐
│ NÍVEL 3: CONSOLIDATED MEMORY (resumo_final)           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Snapshot final (quando status = 'resolved')           │
│ Formato: PROBLEMA | SOLUCAO | RESULTADO | TOM        │
│ Gerado: 1x via Tool Gerar Resumo Final (Gemini)      │
│ Tamanho: ~300 tokens                                  │
│ Update: INSERT apenas (imutável após criação)         │
└─────────────────────────────────────────────────────────┘
                    ↓ Vira contexto_historico na próxima conversa
                    (loop fecha)
```

**Benefícios:**
- ✅ Cliente **nunca** precisa repetir histórico
- ✅ Bot tem contexto **sempre disponível** (zero latência)
- ✅ Experiência indistinguível de humano
- ✅ Custo ridículo: ~R$ 17/mês para 10.000 mensagens

**Status:** ✅ **Produção** desde v2.0

---

## 🏷️ SISTEMA DE TAGS v2.2 (Tags Soberanas)

### **Catálogo de Tags**

**🎯 Objetivos (10 tags):**
1. objetivo-aprender
2. objetivo-arrematar-casa
3. objetivo-casa-praia
4. objetivo-diversificar
5. objetivo-flip-imovel
6. objetivo-imovel-comercial
7. objetivo-investimento
8. objetivo-negocio-familiar
9. objetivo-primeira-propriedade
10. objetivo-renda-passiva

**🏆 Conquistas (10 tags):**
1. arrematou-imovel
2. concluiu-modulo-1
3. concluiu-modulo-2
4. concluiu-modulo-3
5. mentor-ativo
6. multiplas-arrematacoes
7. primeira-proposta
8. primeiro-lucro
9. primeiro-negocio
10. visitou-imovel

### **Arquitetura Tags Soberanas**

```
SUPABASE (Fonte Única de Verdade)
├─ Tabela: tags_disponiveis (catálogo 20 tags)
├─ Tabela: alunos.tags_objetivos[] (array PostgreSQL)
└─ Tabela: alunos.tags_conquistas[] (array PostgreSQL)
  ↓ Leitura via get_tags_para_prompt()
  ↓ Modificação APENAS via N8N
  ↓
N8N CHATWOOT CENTRAL (Processamento)
├─ Node 3.6.5: Supervisor IA (Gemini 2.5 Flash)
│    └─ Detecta tags na conversa
├─ Node 3.6.7: Calcular Tags Finais (merge)
├─ Node 3.6.8: UPDATE em alunos (Supabase)
└─ Node 3.6.9: Sync Labels Chatwoot (espelhamento)
  ↓ Sincronização unidirecional
  ↓
CHATWOOT (Espelhamento Read-Only)
└─ Labels para visualização e filtros
    (Não pode modificar tags direto no Chatwoot)
```

**Status:** ✅ **Produção** desde v2.2 (24/10/2025)

---

## 📊 LÓGICA DE FUNIS (Dual Classification)

### **Funis Globais (5 tipos)**

| ID | Nome | Condição | Template |
|----|------|----------|----------|
| 1 | **Nunca Acessou** | 0% progresso | Global |
| 2 | **Recompra** | >60% progresso | Global |
| 3 | **Engajado (Geral)** | 21-60% + ativo (<30 dias) | Específico |
| 4 | **Desengajado (Geral)** | 1-60% + inativo (≥30 dias) | Global |
| 5 | **Primeiro Acesso** | 1-20% + ativo (<30 dias) | Específico |

### **Funis Trilha (2 tipos)**

| ID | Nome | Condição | Template |
|----|------|----------|----------|
| 1 | **Engajado (Trilha)** | >50% trilha | Específico |
| 2 | **Desengajado (Trilha)** | ≤50% trilha | Específico |

### **Regra de Decisão**

```
CLASSIFICAR Funil Global (SEMPRE)
  ↓
É "urgente"? (IDs 1, 2, 4)
  ├─ SIM → Usa template GLOBAL (ignora trilha)
  └─ NÃO → É "ativo"? (IDs 3, 5)
      ├─ SIM → CLASSIFICAR Funil Trilha
      │        └─ Usa template ESPECÍFICO
      └─ NÃO → Erro (nunca acontece)
```

**Status:** ✅ **Validado** (100% acurácia em testes)

**Single Source of Truth:** Classificação executada **APENAS** no Run_Campaign → Salva em `snapshots_alunos_campanhas` → Todos leem de lá

---

## 💾 BANCO DE DADOS v2.8

### **13 Tabelas**

**CORE (4):**
1. `alunos` - Cadastro + tags + **ativo (BOOLEAN)** + apelido (auto-fill via trigger)
2. `trilhas` - Módulos do curso
3. `progresso_alunos` - Avanço por trilha
4. `templates` - Mensagens WhatsApp pré-aprovadas

**FUNIS (2):**
5. `funis_globais` - 5 tipos
6. `funis_especificos` - 2 tipos

**OPERAÇÃO (3):**
7. `campanhas` - Registro execuções
8. `logs_envios` - Auditoria
9. `snapshots_alunos_campanhas` - BI

**CHATWOOT (2):**
10. `conversas_chatwoot` - Memória Hierárquica (3 campos: contexto_historico, resumo_evolutivo, resumo_final)
11. `mensagens_chatwoot` - Audit trail 1:1

**TAGS (1):**
12. `tags_disponiveis` - Catálogo 20 tags (10 objetivos + 10 conquistas)

**AUDIT (1):**
13. `webhook_logs` - Logs de webhooks recebidos

### **Funções SQL (2)**

1. `buscar_dossie_cs(aluno_id)` v2.2 - Retorna dossiê completo + **campo ativo**
2. `get_tags_para_prompt()` v2.2 - Retorna JSON com tags disponíveis

### **Triggers (2)**

1. `trigger_criar_templates_padrao` - Cria templates padrão ao criar nova trilha
2. `trigger_atualizar_aluno_automatico` - Auto-fill apelido + valida celular → define ativo

**Status:** ✅ **v2.8 em Produção**

---

## 🔌 INTEGRAÇÕES EXTERNAS

| API | Uso | Status | Custo Mensal |
|-----|-----|--------|--------------|
| **WhatsApp Business API** | Envio mensagens | ✅ Ativa | ~R$ 50 (500 msgs) |
| **Chatwoot API** | Central atendimento | ✅ Ativa | R$ 0 (self-hosted) |
| **OpenAI API** | GPT-4.5-nano + Whisper + Vision | ✅ Ativa | ~R$ 30 (500 conversas) |
| **Google Gemini API** | 2.5 Flash (summaries) | ✅ Ativa | ~R$ 10 (10k summaries) |
| **Google Sheets API** | Interface operacional | ✅ Ativa | R$ 0 (free tier) |
| **Supabase** | PostgreSQL v2.8 | ✅ Ativa | R$ 0 (free tier 500MB) |

**Custo Total:** ~R$ 90/mês (500 conversas/mês)

---

## 📈 ROADMAP

### **Imediato (Novembro 2025)**

**Prioridade Máxima:**
- [ ] Integrar Tool "Enviar WhatsApp + Chatwoot" no Run_Campaign Node 4.6
- [ ] Implementar Nodes 4.7-4.8 (logs + snapshots)
- [ ] Implementar Node 5 (finalização campanha)
- [ ] Deploy Run_Campaign em produção
- [ ] Testes end-to-end com campanha real

**Prioridade Alta:**
- [ ] Métricas dashboard (taxa resposta, tempo resolução, ROI)
- [ ] Alertas automáticos (falhas, limites API)
- [ ] Backup automatizado Supabase

### **Curto Prazo (Dezembro 2025)**

- [ ] Implementar Send_Broadcast (disparos manuais)
- [ ] A/B Testing templates
- [ ] Segmentação avançada (comportamento, NPS)
- [ ] Integração Email Marketing

### **Médio Prazo (2026 Q1)**

- [ ] Dashboard analytics avançado (Metabase)
- [ ] Automação handoff (análise sentimento)
- [ ] Multi-canal (SMS, Telegram, Instagram DM)
- [ ] API pública para integrações

---

## 📊 MÉTRICAS DE SUCESSO

### **MVP (Run_Campaign + Chatwoot)**

| Métrica | Target | Atual | Status |
|---------|--------|-------|--------|
| Classificação correta funis | 100% | 100% | ✅ |
| Taxa entrega WhatsApp | >95% | N/A | ⏳ |
| Taxa resposta chatbot | >80% | N/A | ⏳ |
| Tempo médio resposta bot | <2min | ~5s | ✅ |
| NPS atendimento | >8.0 | N/A | ⏳ |
| Uptime sistema | >99% | 100% | ✅ |

### **Business (Próximos 3 meses)**

- [ ] Taxa reengajamento >20% vs baseline
- [ ] Redução 50% tempo suporte manual
- [ ] ROI positivo em 3 meses
- [ ] NPS >8.5

---

## 🚨 RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Limite API WhatsApp | Média | Alto | Rate limiting + escalonamento |
| Falha classificação funil | Baixa | Alto | Testes automatizados + validação staging |
| Sobrecarga Chatwoot | Média | Médio | Throttling + mensagens aguarde |
| Custo IA alto | Baixa | Médio | Monitoramento + caching + Gemini Flash |
| Templates reprovados Meta | Baixa | Alto | Templates genéricos + testes |

---

## 📚 DOCUMENTOS RELACIONADOS

- **LOGICA_DE_FUNIS.md** - Classificação dual detalhada
- **TABELAS.md** - Schema banco v2.2 completo
- **PLANILHAS.md** - Interface Google Sheets
- **MAPA_DE_DEPENDENCIAS.md** - Relações entre componentes
- **Workflows (12 arquivos)** - Specs técnicas completas
- **README.md** - Visão geral projeto

---

## 👥 EQUIPE

**Desenvolvedor:** Tiago Gladstone  
**AI Assistant:** GitHub Copilot  
**Cliente/Produto:** Bruno Lucarelli  
**Versão Atual:** v2.2  
**Status Geral:** **80% Implementado** (4/5 workflows operacionais)

---

**Última Atualização:** 30 de Outubro de 2025  
**Próxima Revisão:** Após deploy Run_Campaign em produção

---

## Atores do Sistema

### 1. **Gestor (Felipe)**
- Define estratégia de comunicação
- Aprova templates de mensagens
- Analisa resultados (BI)
- Ajusta regras de funis se necessário

### 2. **Operador CS (Pamela)**
- Inicia campanhas
- Monitora execução
- Responde alunos que engajam
- Reporta problemas

### 3. **Sistema (Automação)**
- Classifica alunos em funis
- Escolhe mensagens corretas
- Envia via WhatsApp
- Registra tudo para análise

### 4. **Aluno**
- Recebe mensagem personalizada
- Responde (ou não)
- Continua ou não no curso

---

## Ciclo Completo de uma Campanha

### FASE 1: Preparação (Antes do Lançamento)

**Responsável:** Gestor + Operador

#### 1.1 Definir Estrutura do Produto
```
Ações:
- Cadastrar trilhas no banco de dados
- Definir ordem sequencial (Trilha 1, 2, 3...)
- Mapear conteúdo de cada trilha
```

**Exemplo Bruno:**
- Trilha 1: Fundamentos (Boas-vindas + S1)
- Trilha 2: Análise de Imóveis (S2)
- Trilha 3: Arremate e Pós-Venda (S3)

#### 1.2 Criar e Aprovar Templates WhatsApp
```
Ações:
- Escrever copy das 9 mensagens (3 globais + 6 específicas)
- Enviar para aprovação WhatsApp Business
- Cadastrar IDs aprovados no banco
- Aguardar aprovação (24-48h)
```

**Templates Necessários:**
- `nunca_acessou` (global)
- `desengajado_geral` (global)
- `recompra` (global)
- `engajado_trilha_t1`, `engajado_trilha_t2`, `engajado_trilha_t3`
- `desengajado_trilha_t1`, `desengajado_trilha_t2`, `desengajado_trilha_t3`

#### 1.3 Definir Regras de Comunicação
```
Ações:
- Mapear qual template para qual funil
- Templates já contêm funis integrados (funil_global_id ou trilha_id + funil_especifico_id)
- Validar que não há "buracos" (aluno sem template)
```

**Exemplo:**
```
Template "engajado_trilha_t2"
- trilha_id = 2 (Semana 02)
- funil_especifico_id = 1 (Engajado Trilha)
- ativo = true

Se aluno está "Engajado (Trilha)" na Trilha 2
→ Sistema busca automaticamente este template
```

#### 1.4 Preparar Cronograma
```
Ações:
- Definir datas de disparo por trilha
- Alinhar com cronograma de aulas ao vivo (se houver)
- Comunicar ao operador
```

**Exemplo Bruno (Black Friday):**
- 05/11: Boas-vindas
- 12/11: Campanha Trilha 1
- 19/11: Campanha Trilha 2
- 26/11: Campanha Trilha 3

---

### FASE 2: Execução (Dia da Campanha)

**Responsável:** Operador (com supervisão do Sistema)

#### 2.1 Iniciar Campanha (Manual)

**Passo a Passo do Operador:**

1. **Abrir Google Sheets**
   - Acessar planilha "Painel de Controle - Campanhas CS"

2. **Selecionar Trilha**
   - Na célula `A2`, escolher trilha no menu suspenso
   - Exemplo: "Trilha 02: Análise de Imóveis"

3. **Acionar Gatilho**
   - Marcar checkbox na célula `C2`
   - Confirmar que está marcado (aparece ✓)

4. **Aguardar Confirmação**
   - Célula `D2` muda para "Iniciando..."
   - Sistema trava o checkbox automaticamente
   - **NÃO marcar novamente!**

**Tempo estimado:** 30 segundos

#### 2.2 Processamento Automático (Sistema)

**O que acontece nos bastidores:**

```
1. Sistema detecta checkbox marcado (30s após marcar)
2. Trava o gatilho (impede disparo duplo)
3. Cria registro da campanha no banco
4. Valida configuração (regras + templates)
5. Busca lista de alunos elegíveis (com celular)
6. Inicia processamento individual:
   
   Para cada aluno:
   a) Calcula progresso geral
   b) Calcula progresso da trilha atual
   c) Classifica em Funil Global
   d) Se ativo, classifica em Funil da Trilha
   e) Busca template correto
   f) Envia mensagem via WhatsApp
   g) Registra log de envio
   h) Salva snapshot para BI
   
7. Finaliza campanha
8. Atualiza relatório na planilha
```

**Tempo estimado:** 5-10 minutos para 400 alunos

#### 2.3 Acompanhamento em Tempo Real (Operador)

**Durante o processamento:**

- Monitorar coluna `D2` (Status do Processo)
- Ver total processados em `G2`
- Verificar sucessos em `H2`

**Status possíveis:**
- "Iniciando..." → Sistema começou
- "Processando..." → Enviando mensagens
- "Concluída" → Tudo enviado com sucesso
- "FALHA: [motivo]" → Algo deu errado

**Se der erro:**
1. Anotar mensagem de erro da coluna `F2`
2. NÃO marcar checkbox novamente
3. Chamar suporte técnico
4. Aguardar correção

#### 2.4 Verificar Resultados (Operador)

**Após conclusão:**

1. **Abrir aba `ALUNOS_DASHBOARD`**
   - Ver lista de todos processados
   - Verificar funil de cada aluno
   - Confirmar template enviado

2. **Validar Números**
   - Total processados = Total de alunos com celular?
   - Taxa de sucesso > 95%?
   - Se não, investigar erros

**Exemplo de linha no dashboard:**
```
Email: joao@email.com
Nome: João Silva
Funil Global: Engajado (Geral)
Funil Trilha: Desengajado (Trilha)
Status Envio: Sucesso
Data: 16/10/2025 14:30
```

---

### FASE 3: Acompanhamento (Dias Seguintes)

**Responsável:** Operador

#### 3.1 Monitorar Respostas (ChatÚte)

**Quando alunos respondem:**

1. Respostas chegam no ChatÚte
2. Operador vê contexto (qual funil estava)
3. Responde de forma personalizada
4. Anota insights importantes

**Exemplo:**
```
Aluno: "Não consigo fazer o exercício da S2"
Operador vê: "Funil Trilha = Desengajado (Trilha)"
Resposta: "Oi João! Vi que você está na S2. 
          O exercício que trava mais é o X. 
          Quer uma dica?"
```

#### 3.2 Marcar Resultados (Opcional)

**Para análise futura:**
- Aluno respondeu? (Tag: "Respondeu")
- Aluno resolveu problema? (Tag: "Resolvido")
- Aluno precisa follow-up? (Tag: "Follow-up")

---

### FASE 4: Análise (Pós-Campanha)

**Responsável:** Gestor

#### 4.1 Métricas Principais

**Dados disponíveis no banco:**

```sql
-- Taxa de entrega
SELECT 
  COUNT(*) as total_enviados,
  SUM(CASE WHEN status = 'sucesso' THEN 1 ELSE 0 END) as entregues,
  (entregues::float / total_enviados) * 100 as taxa_entrega
FROM logs_envios
WHERE campanha_id = '[ID_DA_CAMPANHA]';
```

**Métricas esperadas:**
- Taxa de entrega: > 95%
- Taxa de resposta: 10-20%
- Taxa de reengajamento: 5-10% (alunos que voltaram)

#### 4.2 Análise por Funil

**Perguntas estratégicas:**

```
1. Qual funil teve mais engajamento?
   → Mensagem está boa ou precisa ajustar?

2. Qual funil não respondeu?
   → Aluno realmente não quer ou mensagem errada?

3. Alunos mudaram de funil após mensagem?
   → Sistema está funcionando?
```

#### 4.3 Ajustes para Próxima Campanha

**Com base nos dados:**

- Melhorar copy de templates com baixo engajamento
- Ajustar limites de funis (ex: 50% → 60%)
- Criar novos funis se identificar padrão
- Mudar horário de disparo se necessário

---

## Fluxos Especiais

### Caso 1: Aluno Nunca Recebeu Mensagem

**Diagnóstico:**
1. Verificar se tem celular cadastrado
2. Verificar formato do celular (55XXXXXXXXXXX)
3. Verificar se caiu em algum funil
4. Verificar se existe template para aquele funil

**Solução:**
- Se sem celular → Adicionar manualmente
- Se formato errado → Corrigir no banco
- Se sem funil → Bug, reportar
- Se sem template → Configurar regra

### Caso 2: Aluno Recebeu Mensagem Errada

**Diagnóstico:**
1. Ver snapshot da campanha (qual funil estava)
2. Ver regra de comunicação (qual template deveria ser)
3. Ver log de envio (qual template foi enviado)

**Solução:**
- Se classificação errada → Ajustar lógica de funis
- Se template errado → Verificar colunas funil_* do template na tabela
- Se bug no workflow → Conferir Node 4.6 (Buscar Template)

### Caso 3: Sistema Travou no Meio da Campanha

**Sintomas:**
- Status parou em "Processando..."
- Total processados não aumenta há 10+ min
- Alguns alunos receberam, outros não

**Ações imediatas:**
1. **NÃO** marcar checkbox novamente
2. Verificar logs do N8N
3. Anotar quantos foram processados
4. Chamar suporte técnico

**Depois da correção:**
- Sistema pode retomar de onde parou
- Ou pode precisar reprocessar (sem duplicar)

---

## Boas Práticas Operacionais

### ✅ FAZER

- Conferir trilha selecionada antes de marcar checkbox
- Aguardar conclusão total antes de iniciar nova campanha
- Documentar problemas e soluções
- Responder alunos em até 24h
- Fazer backup da planilha semanalmente

### ❌ NÃO FAZER

- Marcar checkbox múltiplas vezes
- Iniciar campanha sem templates aprovados
- Mexer em abas ocultas da planilha
- Rodar múltiplas campanhas simultâneas (MVP)
- Ignorar mensagens de erro

---

## Horários e Limitações

### Horário Comercial
- **Recomendado:** 9h às 18h (horário do aluno)
- **Evitar:** Finais de semana e feriados
- **Nunca:** Depois das 20h (WhatsApp pode bloquear)

### Limitações Técnicas (MVP)
- 1 campanha por vez
- Máximo 1000 alunos por campanha
- Processamento: ~5 min/400 alunos
- Cooldown: 30 min entre campanhas

---

## Checklist Pré-Campanha

**1 semana antes:**
- [ ] Templates criados e aprovados no WhatsApp
- [ ] Regras de comunicação cadastradas
- [ ] Cronograma definido e comunicado
- [ ] Planilha atualizada com alunos mais recentes

**1 dia antes:**
- [ ] Validar que trilhas estão corretas no banco
- [ ] Testar workflow de sincronização
- [ ] Confirmar que operador está disponível
- [ ] Preparar mensagens de follow-up

**No dia:**
- [ ] Conferir trilha selecionada
- [ ] Verificar horário (9h-18h)
- [ ] Ter ChatÚte aberto para monitorar
- [ ] Café preparado ☕

---

## Glossário

**Termos que você vai ouvir:**

- **Trilha** - Módulo, semana ou etapa do curso
- **Funil** - Classificação do estado do aluno
- **Template** - Mensagem pré-aprovada do WhatsApp
- **Campanha** - Uma execução completa do sistema
- **Snapshot** - "Fotografia" do aluno no momento da campanha
- **Gatilho** - Checkbox que inicia a campanha
- **Webhook** - Forma automática de sincronizar dados

---

## Suporte

**Problemas operacionais:** Pamela  
**Problemas técnicos:** Tiago  
**Decisões de negócio:** Felipe  

**Documentação técnica:** `/workflows/[CS] Run_Campaign.md`

---

**Última atualização:** 16/10/2025  
**Próxima revisão:** Após MVP (05/11/2025)
