# MENU CUSTOMIZADO - Disparo Manual de Workflows

**Versão:** 1.0  
**Data de Criação:** 29 de Outubro de 2025  
**Status:** ✅ Implementado e Operacional  
**Tipo:** Documentação Técnica

---

## 📜 HISTÓRICO DE VERSÕES

| Versão | Data | Mudanças | Responsável |
|--------|------|----------|-------------|
| 1.0 | 29/10/2025 | Implementação inicial: Menu com 2 funções (Run_Campaign + Sync_Sheets) via Apps Script + Webhooks N8N | Tiago + Copilot |

---

## 🎯 VISÃO GERAL

Sistema de **disparo manual** de workflows N8N através de menu customizado no Google Sheets, permitindo ao operador executar processos sob demanda sem depender de timers ou acessar interface N8N.

### **Decisão de Design:**

**Menu Customizado** foi escolhido ao invés de botões visuais porque:
- ✅ Funcionalidade nativa do Google Sheets (mais profissional)
- ✅ Não ocupa espaço na planilha (interface limpa)
- ✅ Mais robusto (não pode ser apagado acidentalmente)
- ✅ Fácil de expandir com novas funcionalidades

---

## 📊 FUNCIONALIDADES

| Função | Acesso | Descrição | Workflow |
|--------|--------|-----------|----------|
| **Disparar Campanha** | Menu → 🚀 Automações CS → ▶ Disparar Campanha | Inicia workflow de campanha imediatamente com trilha selecionada na célula A2 | `[CS] Run_Campaign` |
| **Sincronizar Trilhas** | Menu → 🚀 Automações CS → 🔄 Sincronizar Trilhas | Atualiza lista de trilhas do PostgreSQL para aba `_config_trilhas` | `[CS] Sync_Sheets_Config` |
| **Informações** | Menu → 🚀 Automações CS → ℹ️ Sobre | Exibe versão e informações do sistema | (Pop-up) |

---

## 🏗️ ARQUITETURA

```
┌──────────────────────────────────┐
│  Google Sheets                   │
│  Menu: 🚀 Automações CS          │
│    ├─ ▶ Disparar Campanha       │
│    ├─ 🔄 Sincronizar Trilhas     │
│    └─ ℹ️ Sobre                   │
└──────────────────────────────────┘
            ↓
┌──────────────────────────────────┐
│  Google Apps Script              │
│  - disparaCampanha()             │
│  - sincronizaTrilhas()           │
│  - onOpen() (cria menu)          │
└──────────────────────────────────┘
            ↓ HTTP POST
┌──────────────────────────────────┐
│  N8N Webhooks (autenticados)     │
│  - /webhook/cs/run-campaign      │
│  - /webhook/cs/sync-sheets       │
└──────────────────────────────────┘
            ↓
┌──────────────────────────────────┐
│  N8N Workflows                   │
│  - [CS] Run_Campaign             │
│  - [CS] Sync_Sheets_Config       │
└──────────────────────────────────┘
```

---

## 🔧 COMPONENTES TÉCNICOS

### **1. Google Apps Script**

**Localização:** Planilha → Extensões → Apps Script  
**Projeto:** "Automações CS"  
**Funções principais:**

```javascript
// Dispara campanha manualmente
function disparaCampanha()

// Sincroniza trilhas do PostgreSQL
function sincronizaTrilhas()

// Cria menu ao abrir planilha
function onOpen()

// Mostra informações
function mostrarInfo()
```

**Configuração:**
```javascript
const CONFIG = {
  WEBHOOK_CAMPAIGN: 'https://wbhooks.tcsbrunolucarelli.uk/webhook/cs/run-campaign/manual',
  WEBHOOK_SYNC: 'https://wbhooks.tcsbrunolucarelli.uk/webhook/cs/sync-sheets/manual',
  API_KEY: '[TOKEN_64_CARACTERES]',
  ABA_CONTROLE: 'CONTROLE'
};
```

---

### **2. N8N Webhooks**

**Credencial:** `CS Webhooks | API Key`  
**Tipo:** Header Auth  
**Header:** `x-api-key`  
**Token:** 64 caracteres (compartilhado por ambos webhooks)

**Endpoints:**

| Workflow | URL | Method | Auth |
|----------|-----|--------|------|
| Run_Campaign | `/webhook/cs/run-campaign/manual` | POST | Header Auth |
| Sync_Sheets | `/webhook/cs/sync-sheets/manual` | POST | Header Auth |

**Integração com workflows:**
- Webhooks conectam diretamente aos primeiros nodes de processamento
- Schedule Triggers (timers) continuam funcionando em paralelo
- Workflows podem ser disparados por **timer OU webhook**

---

## 📝 COMO USAR

### **Disparar Campanha Manualmente:**

1. Abrir planilha `Planilha_de_Controle_CS`
2. Aba **CONTROLE**, célula **A2:** Selecionar trilha (dropdown)
3. Menu **🚀 Automações CS** → **▶ Disparar Campanha**
4. Aguardar pop-up: "✅ SUCESSO - Campanha disparada com sucesso!"
5. Célula D2 mostra: "Processando..."
6. Dashboard atualiza automaticamente após conclusão

**Validações:**
- ❌ Se A2 vazia: Pop-up de erro solicitando seleção de trilha
- ❌ Se webhook offline: Pop-up com mensagem de erro de conexão
- ❌ Se token inválido: Pop-up com erro de autenticação

---

### **Sincronizar Trilhas:**

1. Menu **🚀 Automações CS** → **🔄 Sincronizar Trilhas**
2. Aguardar pop-up: "✅ SUCESSO - Sincronização de trilhas iniciada!"
3. Aba `_config_trilhas` atualiza em 5-10 segundos
4. Dropdown da célula A2 (aba CONTROLE) reflete trilhas atualizadas

**Quando usar:**
- Nova trilha criada no sistema
- Trilha arquivada/removida
- Nomes de trilhas foram alterados
- Validação de sincronização após mudanças no PostgreSQL

---

## 🔒 SEGURANÇA

### **Autenticação:**

- **Token:** 64 caracteres hexadecimais gerado com `openssl rand -hex 32`
- **Transmissão:** Header HTTP `x-api-key` (não em URL)
- **Armazenamento:** Apps Script (privado na planilha) + N8N (credencial criptografada)

### **Controle de Acesso:**

- **Apps Script:** Apenas usuários com acesso à planilha podem executar
- **N8N Webhooks:** Requerem token válido (rejeitam 401 se inválido)
- **Auditoria:** Apps Script registra email do usuário que disparou (`Session.getActiveUser().getEmail()`)

### **Limitações:**

- **Rate Limiting:** Apps Script limita chamadas HTTP por minuto
- **Timeout:** Webhook responde imediatamente (workflow processa assincronamente)
- **Concorrência:** Múltiplos disparos simultâneos são enfileirados no N8N

---

## 🐛 TROUBLESHOOTING

### **Erro: Menu não aparece**

**Causa:** Função `onOpen()` não executou  
**Solução:**
1. Recarregar planilha (F5)
2. Ou: Apps Script → Executar → `onOpen` manualmente

---

### **Erro: "DNS error" ou "Request failed"**

**Causa:** URL do webhook incorreta ou N8N offline  
**Solução:**
1. Verificar URLs em `CONFIG` no Apps Script
2. Testar URLs no navegador (deve retornar 405, não 404)
3. Verificar se N8N está rodando

---

### **Erro: "Unauthorized" ou código 401**

**Causa:** Token de API incorreto  
**Solução:**
1. Verificar `API_KEY` no Apps Script
2. Verificar credencial no N8N
3. Confirmar que ambos usam o mesmo token

---

### **Erro: "Por favor, selecione uma trilha"**

**Causa:** Célula A2 vazia ao disparar campanha  
**Solução:** Selecionar trilha no dropdown da célula A2 antes de disparar

---

## 📊 LOGS E MONITORAMENTO

### **Apps Script:**

- **Execution Log:** Apps Script → Execuções (registra timestamp, função, usuário)
- **Logger:** `Logger.log()` captura erros em tempo real

### **N8N:**

- **Executions:** Menu lateral → Executions (filtra por workflow)
- **Webhook Logs:** Mostra payload recebido e resposta enviada
- **Error Tracking:** Execuções falhadas aparecem em vermelho

### **Payload Enviado:**

**disparaCampanha:**
```json
{
  "trilha": "Semana 01",
  "gatilho_manual": true,
  "disparado_por": "usuario@email.com",
  "timestamp": "2025-10-29T14:36:45.123Z"
}
```

**sincronizaTrilhas:**
```json
{
  "disparado_por": "usuario@email.com",
  "timestamp": "2025-10-29T14:37:12.456Z"
}
```

---

## 🔄 INTEGRAÇÃO COM WORKFLOWS

### **[CS] Run_Campaign**

**Documentação:** `workflows/[CS] Run_Campaign.md`

**Integração:**
- Webhook conecta no **Node 1.2 (Read Control Panel)**
- Lê mesma célula A2 que timer usa
- Executa **identicamente** ao disparo por timer
- Campo `gatilho_manual: true` permite identificar origem

**Vantagens:**
- ✅ Disparo imediato (não espera timer de 1 minuto)
- ✅ Teste de campanhas sem marcar checkbox
- ✅ Disparos pontuais urgentes (ex: live hoje à noite)

---

### **[CS] Sync_Sheets_Config**

**Documentação:** `workflows/[CS] Sync_Sheets_Config.md`

**Integração:**
- Webhook conecta no **primeiro node (Get Trilhas do PostgreSQL)**
- Executa **identicamente** ao disparo por timer
- Atualiza aba `_config_trilhas` normalmente

**Vantagens:**
- ✅ Sincronização sob demanda (não espera timer diário)
- ✅ Validação imediata após criar trilha no sistema
- ✅ Correção rápida de inconsistências

---

## 🚀 CASOS DE USO

| Situação | Método Recomendado | Motivo |
|----------|-------------------|--------|
| Campanha semanal recorrente (Segunda 10h) | Timer (checkbox) | Automação consistente |
| Teste de nova campanha criada | Menu (botão) | Validação imediata |
| Disparo urgente (live hoje 20h) | Menu (botão) | Não espera timer |
| Nova trilha adicionada no sistema | Menu (Sync) | Atualiza dropdown agora |
| Sincronização diária de trilhas | Timer | Manutenção automática |
| Debug de campanha com erro | Menu (botão) | Testa múltiplas vezes |

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- **Workflows:**
  - `workflows/[CS] Run_Campaign.md` - Workflow de campanhas
  - `workflows/[CS] Sync_Sheets_Config.md` - Workflow de sincronização
  
- **Planilhas:**
  - `docs/PLANILHAS.md` - Estrutura das planilhas Google Sheets
  - `docs/TABELAS.md` - Estrutura das tabelas PostgreSQL
  
- **Arquitetura:**
  - `MAPA_DE_DEPENDENCIAS.md` - Mapa completo de dependências
  - `README.md` - Visão geral do projeto

---

## ✅ STATUS ATUAL

- ✅ **Apps Script:** Implementado e funcional
- ✅ **Webhooks N8N:** Configurados e testados
- ✅ **Menu Customizado:** Aparece automaticamente ao abrir planilha
- ✅ **Função disparaCampanha:** Testada e operacional
- ✅ **Função sincronizaTrilhas:** Testada e operacional
- ✅ **Autenticação:** Token seguro configurado
- ✅ **Feedback ao usuário:** Pop-ups de sucesso/erro funcionando

---

**Última atualização:** 29/10/2025  
**Autor:** Tiago Gladstone + GitHub Copilot  
**Status:** ✅ Documentação completa e funcionalidade operacional
