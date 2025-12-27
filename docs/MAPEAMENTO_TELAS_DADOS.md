# Mapeamento de Telas vs. Dados (Design UI-First)

Este documento valida a modelagem de dados através das telas e ações necessárias no sistema "Terceiriza CS".

---

## 🔐 1. Telas de Acesso e Configuração Inicial

### 1.1. Login
*   **Objetivo:** Acesso seguro de Admin e Equipe CS.
*   **Ações:** Login com E-mail/Senha (Supabase Auth).
*   **Dados Necessários:**
    *   `auth.users` (Padrão Supabase).
    *   *Futuro:* Tabela `perfil_usuarios` se precisar de níveis de acesso (Admin vs Agente).

### 1.2. Vincular Meta (Setup WhatsApp)
*   **Objetivo:** Conectar a API oficial do WhatsApp Business.
*   **Interface:**
    *   Formulário para inserir: `Access Token`, `Phone Number ID`, `Business Account ID`.
    *   Status da Conexão (Verde/Vermelho).
*   **Dados Necessários (Tabela `configuracoes`):**
    *   Registro de chaves de API de forma segura.
    *   `configuracoes` (chave, valor).

### 1.3. Gestão de Templates Meta
*   **Objetivo:** Sincronizar e selecionar quais templates do WhatsApp serão usados nas automações.
*   **Interface:**
    *   Botão "Sincronizar Templates da Meta" (Puxa da API).
    *   Lista de Templates com Checkbox (Ativar/Desativar).
    *   Dropdown para associar Template a um Funil (ex: "Associar 'hello_world' ao Funil 'Boas Vindas'").
*   **Dados Necessários (Tabela `templates`):**
    *   `template_id_whatsapp`, `conteudo`, `status_meta`.
    *   Vínculos: `funil_global_id`, `funil_especifico_id`, `produto_id` (NOVO: templates específicos por produto).

---

## 📦 2. Telas de Gestão de Produtos e Integração

### 2.1. Puxar/Sincronizar Produtos (Hotmart)
*   **Objetivo:** Trazer o catálogo de cursos da Hotmart para dentro do sistema.
*   **Interface:**
    *   Botão "Importar Produtos Hotmart".
    *   Lista de Produtos encontrados (Capa, Nome, ID Hotmart).
    *   Toggle "Ativar Monitoramento CS" (para decidir quais produtos o robô vai cuidar).
*   **Dados Necessários (Tabela `produtos`):**
    *   `nome`, `hotmart_id`, `capa_url`.
    *   `ativo` (boolean).

### 2.2. Importar Base de Alunos (Backfill)
*   **Objetivo:** Puxar histórico de quem já comprou antes do sistema existir.
*   **Interface:**
    *   Filtro por Produto ou Data.
    *   Botão "Importar Histórico".
    *   Barra de progresso da importação.
*   **Dados Necessários:**
    *   `alunos` (Cadastro básico).
    *   `matriculas` (Para saber qual produto ele comprou).
    *   `transacoes` (Opcional, para histórico financeiro).

---

## 👥 3. Telas Operacionais (Dia a Dia do CS)

### 3.1. Cadastro/Visão de Clientes (CRM)
*   **Objetivo:** Ver a lista de todos os alunos e seus status.
*   **Interface:**
    *   Tabela com: Nome, Email, Status (Ativo/Cancelado), LTV (Valor Gasto), Último Acesso.
    *   Filtros: "Alunos do Produto X", "Cancelados recentementes".
    *   Botão "Novo Aluno" (Cadastro Manual - caso venda fora da Hotmart).
*   **Dados Necessários:**
    *   `alunos` (Dados pessoais).
    *   `matriculas` (Status de acesso).
    *   `produtos` (Nome do curso).

### 3.2. Dossiê do Aluno (Visão 360 detalhada)
*   **Objetivo:** Tela que o CS abre quando está atendendo alguém.
*   **Interface:**
    *   **Header:** Foto, Nome, ZAP (link para Chatwoot).
    *   **Card Financeiro:** Lista de compras (`transacoes`), status de pagamentos, reembolsos.
    *   **Card Acadêmico:** Barra de progresso por curso (`progresso_alunos`).
    *   **Timeline:** Histórico de msgs enviadas, campanhas participadas e notas do Chatwoot.
*   **Dados Necessários:**
    *   Join complexo de `alunos` + `transacoes` + `matriculas` + `progresso_alunos` + `logs_envios`.

### 3.3. Painel de Recuperação (Wall of Cash)
*   **Objetivo:** Ação rápida em abandonos de carrinho.
*   **Interface:**
    *   Lista de Leads "Quentes" (Abandonaram < 1h).
    *   Ação rápida: Botão Zap pré-preenchido ("Oi Fulano, vi que não conseguiu finalizar...").
    *   Status Automático: "Comprou depois?" (Sim/Não).
*   **Dados Necessários (Tabela `recuperacao_vendas`):**
    *   Dados voláteis de leads que ainda não estão na tabela `alunos`.

---

## 📊 4. Conclusão de Dados Faltantes

Para suportar essas telas, a modelagem v2.8 precisa ser expandida com:

1.  **`configuracoes`**: Para tela 1.2 (Meta).
2.  **`produtos`**: Para tela 2.1 (Importar Hotmart) e filtros da tela 3.1.
3.  **`matriculas`**: Para gerenciar quem tem acesso a qual produto (Telas 2.2 e 3.2).
4.  **`transacoes`**: Para o Card Financeiro da tela 3.2 e cálculo de LTV.
5.  **`recuperacao_vendas`**: Para a tela 3.3 (Leads que não são alunos ainda).

A estrutura hierárquica `Produto -> Oferta -> Transação` é essencial para o sistema escalar além de um único curso.
