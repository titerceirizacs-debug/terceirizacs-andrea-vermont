# PLANILHAS - Terceiriza CS

**Versão:** 1.1 ✨ 
**Data de Criação:** 16 de Outubro de 2025  
**Última Atualização:** 29 de Outubro de 2025  
**Status:** ✅ Especificação Completa  
**Para:** Operadores e Gestores

---

## 📜 HISTÓRICO DE VERSÕES

| Versão | Data | Mudanças | Responsável |
|--------|------|----------|-------------|
| **1.1** | **29/10/2025** | **Adicionar coluna G (mensagem_enviada) na aba ALUNOS_DASHBOARD. Permite visualizar mensagem exata enviada para cada aluno com placeholders substituídos.** | **Tiago + Copilot** |
| 1.0 | 16/10/2025 | Especificação inicial das 3 abas (CONTROLE, ALUNOS_DASHBOARD, _config_trilhas) | Tiago + Copilot |

---

# Crie e Estruture a Planilha Google Sheets**

1.  **Crie a Planilha:**
    *   Vá para [sheets.new](https://sheets.new) no seu navegador.
    *   Renomeie o arquivo para algo claro, como `Painel de Controle - Campanhas CS`.

2.  **Crie as Três Abas (Tabs):**
    *   Você já tem uma aba chamada `Página1`. Renomeie-a para `CONTROLE`.
    *   Clique no ícone `+` no canto inferior esquerdo para adicionar uma nova aba. Renomeie-a para `ALUNOS_DASHBOARD`.
    *   Adicione uma terceira aba e renomeie-a para `_config_trilhas`. O underscore `_` no início é uma convenção para indicar que é uma aba "de sistema" e não deve ser mexida manualmente.

3.  **Configure a Aba `CONTROLE`:**
    *   Na célula **A1**, digite: `Semana em Foco`
    *   Na célula **C1**, digite: `GATILHO DE DISPARO`
    *   Na célula **D1**, digite: `Status do Processo`
    *   Na célula **E1**, digite: `Data Último Disparo`
    *   Na célula **F1**, digite: `Detalhes do Erro`
    *   Na célula **G1**, digite: `Total Processados`
    *   Na célula **H1**, digite: `Total Sucesso`
    *   Na célula **I1**, digite: `Total Falha`
    *   Selecione as células de **D2** a **H2**, clique no ícone de balde de tinta e pinte o fundo com um cinza claro. Isso indica que são campos de output.

4.  **Configure a Aba `ALUNOS_DASHBOARD`:**
    *   Na célula **A1**, digite: `email`
    *   Na célula **B1**, digite: `nome_completo`
    *   Na célula **C1**, digite: `funil_geral_calculado`
    *   Na célula **D1**, digite: `funil_trilha_calculado`
    *   Na célula **E1**, digite: `status_ultimo_envio`
    *   Na célula **F1**, digite: `data_ultimo_envio`
    *   **Na célula G1, digite: `mensagem_enviada`** ✨ **NOVO v1.1**
    *   Selecione a linha 1, vá em **Ver > Congelar > 1 linha**. Isso manterá os cabeçalhos visíveis.

5.  **Configure a Aba `_config_trilhas`:**
    *   Na célula **A1**, digite: `nome_trilha`
    *   Na célula **B1**, digite: `id_trilha`

**Resultado Parcial do Passo 1:** Sua planilha está estruturada. Agora vamos dar vida a ela.

---

#### **Passo 2: Ative a Funcionalidade da Planilha**

1.  **Crie o Menu Suspenso (Dropdown):**
    *   Volte para a aba `CONTROLE`.
    *   Clique na célula **A2**.
    *   Vá em **Dados > Validação de dados**.
    *   No menu à direita, clique em "**Adicionar regra**".
    *   Em "Critérios", escolha "**Menu suspenso de um intervalo**".
    *   Clique no ícone de grade para selecionar o intervalo de dados. Na pequena janela que abrir, digite: `_config_trilhas!A2:A`
    *   Clique em "OK" e depois em "Concluído".

2.  **Crie o Checkbox (Caixa de Seleção):**
    *   Ainda na aba `CONTROLE`, clique na célula **C2**.
    *   Vá em **Inserir > Caixa de seleção**.

3.  **Oculte a Aba de Configuração:**
    *   Clique na setinha da aba `_config_trilhas` na parte inferior e selecione "**Ocultar página**".

**Resultado do Passo 2:** Sua planilha agora é um painel de controle interativo. A célula A2 está pronta para receber a lista de trilhas, e o gatilho em C2 está pronto para ser lido.

---
