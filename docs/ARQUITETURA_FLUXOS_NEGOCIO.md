# Arquitetura de Fluxos de Negócio & Dados (Terceiriza CS)

Baseado na visão estratégica do time e na necessidade de **provar valor rápido** (Acesso) e **escalar valor** (Progresso/LTV).

---

## 🎯 1. O Core Business: "Produto Acesso" (MVP)
*O objetivo é garantir que o aluno acesse, diminuindo reembolso e gerando valor imediato.*

### 1.1. Fluxo de Onboarding Imediato (Automático)
**Gatilho:** Webhook Hotmart `PURCHASE_APPROVED`.
**Ação:** Disparo imediato de WhatsApp (Kestra -> Meta API) de forma 100% autônoma.
**Justificativa:** É um evento transacional esperado e crítico. O risco de erro é zero e o ganho de velocidade é essencial para evitar chamados de suporte.

**Fluxo de Dados:**
1.  `PURCHASE_APPROVED` chega.
2.  Verifica se `produtos.ativo_monitoramento = true`.
3.  Insere em `alunos` e `matriculas`.
4.  Busca `template_boas_vindas` específico do produto.
5.  Dispara WhatsApp.
6.  **KPI:** Registra em `kpis_acesso` ("Acesso facilitado via Zap").

### 1.2. Fluxo de "Resgate de Acesso" (Semi-Automático)
**Gatilho:** Cronjob Diário busca alunos com `data_compra < 24h` E `data_primeiro_acesso = NULL`.
**Ação do Sistema:** Gera um registro na **Fila de Disparos Pendentes** (`disparos_sugeridos`).
**Ação Humana:** O CS revisa a fila e clica em "Aprovar Disparo" ou "Descartar".
**Motivo:** Evitar cobrar alguém que já acessou por outro meio ou que teve problema de pagamento. O olho humano é o filtro final.

---

## 🚀 2. O Upsell: "Produto Progresso" (Inteligência)
*Vendido como adicional ou para clientes maduros. Foco em LTV e NPS.*

### 2.1. Monitoramento de Estagnação (Anti-Churn - Aprovação Manual)
**Gatilho:** Cronjob Semanal.
**Lógica:** Aluno parado no módulo X há > 7 dias.
**Ação do Sistema:** Alimenta a **Fila de Reengajamento**.
**Ação Humana:** CS seleciona lote de alunos (ex: "Todos do Módulo 2") e dispara. Pode editar a mensagem se houver contexto específico (ex: feriado, bug na plataforma).

### 2.2. Celebração de Conquistas (Dopamina)
**Gatilho:** `CLUB_MODULE_COMPLETED`.
**Ação:** Mensagem de Parabéns + Tag "Conquista" no Chatwoot.
**Valor:** Aumenta a percepção de acompanhamento (High Touch automatizado).

---

## ⚙️ 3. Engine de Controle Híbrido (Automático vs Manual)

Para garantir segurança, o sistema terá dois modos de operação por regra:

**Nova Tabela: `filas_disparo`** (Ao invés de disparo direto)
*   Recebe sugestões dos cronjobs/regras.
*   Campos: `aluno_id`, `template_sugerido`, `motivo` (ex: "Estagnado Mod 2"), `status` (Pendente, Aprovado, Rejeitado).

**Nova Tabela: `regras_automacao`**
*   `nome`: "Resgate Módulo 1"
*   `modo_execucao`: `SUGERIR_APENAS` (Padrão) ou `DISPARO_AUTOMATICO` (Apenas Compra/Boas-vindas).
*   Isso garante que o CS durma tranquilo sabendo que o robô não vai sair disparando loucamente.

---

## 📊 4. BI & Prova de Valor (O "Cala Boca" do Cliente)
*Como provar que foi a Terceiriza CS que gerou o resultado?*

### 4.1. Rastreamento de Origem do Acesso
Na tabela `matriculas` ou `acessos_log`, precisamos de uma flag `origem_primeiro_acesso`.
*   Valores: `email_hotmart` (Orgânico) vs `link_whatsapp_terceiriza` (Nosso Mérito).
*   **Dashboard:** "Trouxemos 45% dos acessos da turma 10".

### 4.2. Analytics de Sentimento (Chatwoot)
Conforme transcrição, usar tags do Chatwoot para gerar BI.
**Fluxo:**
1.  Atendente/IA marca conversa como `satisfeito` ou `problema_acesso`.
2.  Webhook Chatwoot -> Kestra -> Tabela `bi_tags_analitico`.
3.  **Dashboard de Tags:** Nuvem de palavras de problemas e satisfação.

---

## 🛠️ 5. Próximos Passos Técnicos (Implementação)

1.  **Criar Tabelas de Base:** `produtos`, `ofertas`, `transacoes` (Já mapeadas).
2.  **Criar Tabelas de Inteligência:** `regras_automacao`, `kpis_acesso`, `bi_tags_analitico`.
3.  **Worker de Ingestão (Kestra):** Ouvir `PURCHASE_APPROVED` e popular as bases.
4.  **Worker de Inteligência (Kestra):** Processar as `regras_automacao` periodicamente.
5.  **Dashboard (Frontend):** Tela para o cliente ver "Acessos via Terceiriza" em tempo real.

Essa arquitetura cobre as dores operacionais (automatizar o manual) e as dores de negócio (provar valor para o cliente chato).
