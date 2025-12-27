# Lógica de Funis - Sistema de Classificação de Alunos

**Versão:** 2.1  
**Data de Criação:** 16 de Outubro de 2025  
**Última Atualização:** 18 de Outubro de 2025  
**Status:** ✅ Validado e Aprovado (100% acurácia testada)

---

## 📜 HISTÓRICO DE VERSÕES

| Versão | Data | Mudanças | Responsável |
|--------|------|----------|-------------|
| 2.2 | 18/10/2025 | **Single Source of Truth:** Lógica de classificação agora executada APENAS no Workflow Run_Campaign. Função buscar_dossie_cs() v2.1 lê de snapshots (não recalcula). Elimina duplicação de código e garante consistência | Tiago + Copilot |
| 2.1 | 18/10/2025 | Adicionado sistema de versionamento + referência ao MAPA_DE_DEPENDENCIAS.md | Tiago + Copilot |
| 2.0 | 16/10/2025 | Correção threshold Recompra: `>60%` (não `>=60%`) | Tiago + Copilot |
| 1.5 | 15/10/2025 | Validação completa com 11 alunos (100% acurácia) | Tiago + Copilot |
| 1.0 | 14/10/2025 | Especificação inicial completa | Tiago + Copilot |

---

## Visão Geral

O sistema classifica cada aluno em **DOIS funis simultâneos**:

1. **Funil Global** - Mede a "saúde geral" do aluno no curso/produto completo
2. **Funil da Trilha** - Mede o "ritmo atual" do aluno na trilha específica da campanha

**Analogia:** Como um painel de carro que mostra o combustível (global) e a velocidade (trilha).

**Nota:** "Trilha" = Módulo, Semana, Etapa ou qualquer divisão de conteúdo na área de membros. O sistema funciona independente da nomenclatura.

---

> 🎯 **ARQUITETURA v2.2 - Single Source of Truth**
> 
> A lógica de classificação descrita neste documento é executada em **UM ÚNICO LUGAR**: **Workflow Run_Campaign (Nó 4.3)**.
> 
> **Onde a classificação é calculada:**
> - ✅ Workflow Run_Campaign → Salva em `snapshots_alunos_campanhas`
> 
> **Onde a classificação é LIDA (não recalculada):**
> - ✅ Função `buscar_dossie_cs()` v2.1 → Lê snapshot mais recente
> - ✅ Ferramentas Chatwoot → Via `buscar_dossie_cs()`
> - ✅ Relatórios/Analytics → Via `snapshots_alunos_campanhas`
> 
> **Benefícios:**
> - ⚡ Performance: 10x mais rápido (~10ms vs ~100ms)
> - ✅ Consistência: Mesma classificação em todo o sistema
> - 🔧 Manutenibilidade: Alterar lógica em apenas 1 lugar
> - 📊 Auditabilidade: Histórico completo de quando/por quê aluno foi classificado

---

---

## Funis Globais (5 tipos)

Baseados em: `media_geral` (progresso total) + `ultimo_acesso`

### 1. Nunca Acessou
- **ID:** 1
- **Condição:** `progresso = 0%`
- **Independente de:** Tempo
- **Significa:** Aluno comprou mas nunca logou

### 2. Recompra
- **ID:** 2
- **Condição:** `progresso > 60%` (estritamente maior que 60%)
- **Independente de:** Tempo
- **Significa:** Aluno avançado, candidato a próximo produto

### 3. Engajado (Geral)
- **ID:** 3
- **Condição:** `progresso entre 21% e 60%` **E** `ultimo_acesso ≤ 30 dias`
- **Significa:** Aluno ativo e progredindo bem

### 4. Desengajado (Geral)
- **ID:** 4
- **Condição:** `progresso entre 1% e 60%` **E** `ultimo_acesso > 30 dias`
- **Significa:** Aluno em risco de abandono

### 5. Primeiro Acesso (Geral)
- **ID:** 5
- **Condição:** `progresso entre 1% e 20%` **E** `ultimo_acesso ≤ 30 dias`
- **Significa:** Aluno novo, ainda descobrindo o curso

---

## Funis da Trilha (2 tipos)

Baseados em: `media_trilha_atual` (progresso cumulativo até a trilha da campanha)

### 1. Engajado (Trilha)
- **Condição:** `media_trilha_atual > 50%`
- **Significa:** Aluno em dia ou adiantado no conteúdo da trilha

### 2. Desengajado (Trilha)
- **Condição:** `media_trilha_atual ≤ 50%`
- **Significa:** Aluno atrasado no conteúdo da trilha

**Observação:** Funil da Trilha só é calculado para alunos "ativos" (ver próxima seção).

---

## Regra de Decisão: Qual Funil Usar?

### Funis Globais "Urgentes" (Prioridade Máxima)

Estes 3 funis **ignoram a trilha** e usam apenas templates globais:

1. **Nunca Acessou (ID 1)** → Mensagem de suporte técnico (ajuda com login)
2. **Recompra (ID 2)** → Mensagem de upsell (parabéns e próximo produto)
3. **Desengajado (Geral) (ID 4)** → Mensagem de resgate (reengajamento)

**Motivo:** São situações urgentes ou especiais onde o contexto da trilha atual não importa.

---

### Funis Globais "Ativos" (Olham a Trilha)

Estes 2 funis **combinam com o funil da trilha** e usam templates específicos:

1. **Engajado (Geral) (ID 3)** → Verifica se `Engajado (Trilha)` ou `Desengajado (Trilha)`
2. **Primeiro Acesso (Geral) (ID 5)** → Verifica se `Engajado (Trilha)` ou `Desengajado (Trilha)`

**Motivo:** Aluno está ativo, então faz sentido personalizar por trilha/etapa do conteúdo.

---

## Fluxo de Classificação

```
ALUNO
  ↓
[CLASSIFICA FUNIL GLOBAL]
  ↓
É "Urgente"? (IDs 1, 2, 4: Nunca Acessou, Recompra, Desengajado Geral)
  ↓
  SIM → Usa template GLOBAL (universal)
  ↓
  NÃO → É "Ativo"? (IDs 3, 5: Engajado Geral, Primeiro Acesso Geral)
      ↓
      SIM → [CLASSIFICA FUNIL DA TRILHA]
          ↓
          Usa template ESPECÍFICO (por semana)
```

---

## Templates Necessários

### Templates Globais (3 - Universais)

Usados em qualquer trilha/momento, não mudam:

1. `nunca_acessou` (ID Funil: 1) - Ajuda com acesso/login
2. `recompra` (ID Funil: 2) - Parabéns e oferta de upsell
3. `desengajado_geral` (ID Funil: 4) - Reengajamento/resgate

---

### Templates Específicos (Por Trilha)

Mudam conforme a trilha da campanha. **Exemplo com 3 trilhas:**

**Trilha 1:**
4. `engajado_trilha_t1` - Parabéns pelo ritmo na Trilha 1
5. `desengajado_trilha_t1` - Incentivo para avançar na Trilha 1

**Trilha 2:**
6. `engajado_trilha_t2` - Parabéns pelo ritmo na Trilha 2
7. `desengajado_trilha_t2` - Incentivo para avançar na Trilha 2

**Trilha 3:**
8. `engajado_trilha_t3` - Parabéns pelo ritmo na Trilha 3
9. `desengajado_trilha_t3` - Incentivo para avançar na Trilha 3

**Nota:** O número de templates específicos varia conforme o número de trilhas do produto.

---

## Exemplos Práticos

### Exemplo 1: Aluno João - Nunca Acessou
- **Funil Global:** Nunca Acessou (0%)
- **Funil da Trilha:** Não calculado
- **Template:** `nunca_acessou` (global)
- **Mensagem:** "Oi João, notei que você ainda não acessou. Precisa de ajuda?"

---

### Exemplo 2: Aluna Maria - Abandonou
- **Funil Global:** Desengajado (Geral) (30% mas 40 dias sem acessar)
- **Funil da Trilha:** Não calculado
- **Template:** `desengajado_geral` (global)
- **Mensagem:** "Maria, sentimos sua falta! O que aconteceu?"

---

### Exemplo 3: Aluno Pedro - Veterano
- **Funil Global:** Recompra (70%)
- **Funil da Trilha:** Não calculado
- **Template:** `recompra` (global)
- **Mensagem:** "Parabéns por concluir! Conheça nossa Mentoria Avançada!"

---

### Exemplo 4: Aluna Ana - Ativa e no Ritmo (Trilha 2)
- **Funil Global:** Engajado (Geral) (40%, ativo)
- **Funil da Trilha:** Engajado (Trilha) (80% até Trilha 2)
- **Template:** `engajado_trilha_t2` (específico)
- **Mensagem:** "Ana, parabéns por concluir a Trilha 2! Continue assim!"

---

### Exemplo 5: Aluno Carlos - Ativo mas Atrasado (Trilha 2)
- **Funil Global:** Engajado (Geral) (35%, ativo)
- **Funil da Trilha:** Desengajado (Trilha) (20% até Trilha 2)
- **Template:** `desengajado_trilha_t2` (específico)
- **Mensagem:** "Carlos, vi que a Trilha 2 está parada. Alguma dúvida?"

---

## Cálculo do Progresso

### Media Geral
Progresso total considerando **todas** as trilhas do produto:
```
media_geral = (progresso_t1 + progresso_t2 + progresso_t3 + ... + progresso_tn) / n
```
*Onde `n` = número total de trilhas do produto*

### Media Trilha Atual
Progresso **cumulativo** até a trilha da campanha:

**Na Trilha 1:**
```
media_trilha_atual = progresso_t1 / 1
```

**Na Trilha 2:**
```
media_trilha_atual = (progresso_t1 + progresso_t2) / 2
```

**Na Trilha 3:**
```
media_trilha_atual = (progresso_t1 + progresso_t2 + progresso_t3) / 3
```

**Fórmula Genérica:**
```
media_trilha_atual = soma(progressos até trilha X) / X
```

---

## Resumo para Implementação

### Classificação em 2 Passos:
1. **SEMPRE classifica no Funil Global**
2. **SE aluno for "ativo"**, classifica no Funil da Trilha

### Busca de Template em 2 Níveis:
1. **SE funil é "urgente"** → Busca template global (sem trilha)
2. **SE funil é "ativo"** → Busca template específico (com trilha da campanha)

### Cálculo de Templates Necessários:
```
Total = Templates Globais + Templates Específicos
Total = 3 + (2 × número_de_trilhas)
```

**Exemplo (produto com 3 trilhas):**
- 3 globais + (2 × 3 trilhas) = **9 templates**

**Exemplo (produto com 5 trilhas):**
- 3 globais + (2 × 5 trilhas) = **13 templates**

---

## Aplicabilidade

Este sistema funciona para:
- ✅ Cursos online (módulos)
- ✅ Mentorias (semanas)
- ✅ Treinamentos (etapas)
- ✅ Qualquer produto com conteúdo sequencial em área de membros

**A lógica permanece a mesma, apenas o número de templates específicos varia.**

---

**Documento validado em:** 16/10/2025  
**Próxima revisão:** Após MVP do Bruno (05/11/2025)
