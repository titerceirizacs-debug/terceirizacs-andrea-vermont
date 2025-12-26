---
trigger: always
description: Manter changelog e versão atualizados no projeto base (template)
---

# Regra: Manter Changelog Atualizado

> ⚠️ **Esta regra só se aplica ao PROJETO BASE (TEMPLATE)**
> Quando um projeto derivado for criado, esta regra deve ser REMOVIDA.

## Quando Atualizar

O Agente DEVE atualizar `CHANGELOG.md` e `VERSION` quando:

1. **Adicionar** novo workflow, módulo, ou documentação significativa
2. **Alterar** comportamento de workflows ou módulos existentes
3. **Corrigir** bugs ou problemas documentados
4. **Remover** funcionalidades ou depreciar algo

## Como Atualizar

### VERSION (Versionamento Semântico)
- `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes (estrutura incompatível)
- **MINOR**: Novas funcionalidades (compatível)
- **PATCH**: Correções de bugs

### CHANGELOG.md
Seguir formato [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Adicionado
- Nova funcionalidade X

### Alterado
- Mudança em Y

### Corrigido
- Bug Z

### Removido
- Funcionalidade W (deprecada)
```

## Fluxo Completo

Após fazer mudanças significativas no template, o Agente DEVE:

1. **Atualizar VERSION** - Incrementar conforme semântico
2. **Atualizar CHANGELOG.md** - Documentar o que mudou
3. **Commit** - `git add . && git commit -m "tipo: descrição"`
4. **Push** - `git push`

### Padrão de Commit
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `refactor:` - Refatoração
- `chore:` - Manutenção

## Lembrete Final

Antes de finalizar qualquer tarefa no template, perguntar:
- "Devo atualizar o CHANGELOG/VERSION e fazer push?"
