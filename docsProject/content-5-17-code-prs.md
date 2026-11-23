# Conteúdo: 5.17 Vocabulário de código e PRs

Status: rascunho para revisão. Ainda não foi carregado no banco.

Regras usadas:
- Cada palavra aparece em um só grupo.
- As frases usam as estruturas até o 13º lugar da ordem, incluindo voz passiva.
- "merge" não aparece aqui: ele já está como termo de "merged" no 5.4 (já integrei). "approve" também não, porque o particípio "approved" está no 5.6.

## Grupo A: Substantivos de código

| Termo | Significado no contexto | Exemplo |
|-------|-------------------------|---------|
| function | função | This function returns a list. |
| variable | variável | Rename this variable to userId. |
| parameter | parâmetro | The parameter is optional. |
| dependency | dependência | The dependency is outdated. |
| return value | valor de retorno | The return value is null. |
| class | classe | The class handles the login. |
| method | método | This method saves the data. |
| module | módulo | The module is independent. |
| library | biblioteca | We use a library for dates. |
| package | pacote | The package is on npm. |
| framework | framework | Angular is our framework. |
| component | componente | The header is a component. |
| interface | interface | The interface defines the contract. |
| constant | constante | The constant is in a separate file. |
| loop | laço (repetição) | The loop runs five times. |
| condition | condição | The condition is always true. |
| exception | exceção | The exception was not handled. |
| array | array, lista | The array is empty. |
| object | objeto | The object has three fields. |
| string | texto (string) | The string is too long. |
| API call | chamada de API | The API call takes two seconds. |
| query | consulta | The query is slow. |
| schema | esquema | The schema has three tables. |
| migration | migração (do banco) | The migration adds a column. |
| script | script | The script runs every night. |
| config file | arquivo de configuração | The config file is in the root. |
| environment variable | variável de ambiente | The key is an environment variable. |
| build tool | ferramenta de build | Maven is our build tool. |
| compiler | compilador | The compiler shows a warning. |
| linter | verificador de estilo | The linter found three errors. |
| cache | cache | The cache stores the results. |
| endpoint | endpoint | The endpoint returns JSON. |
| payload | corpo da requisição | The payload is too big. |

## Grupo B: Substantivos de PR e issues

| Termo | Significado no contexto | Exemplo |
|-------|-------------------------|---------|
| pull request | pedido de integração de código | The pull request is ready for review. |
| PR | pedido de integração (abreviação) | The PR has three files. |
| branch | ramificação do código | The branch is up to date. |
| feature branch | ramificação de uma funcionalidade | The feature branch is ready. |
| hotfix | correção urgente | We need a hotfix for production. |
| main branch | ramificação principal | The main branch is protected. |
| commit | salvamento de alterações no git | The commit message is clear. |
| ticket | tarefa registrada no sistema | The ticket is in progress. |
| issue | problema registrado | The issue is open. |
| bug report | relato de bug | The bug report has the steps. |
| changelog | registro de mudanças | The changelog lists the fixes. |
| tag | marcação de versão | The tag is 1.2.0. |
| fork | cópia do repositório | I work on a fork of the project. |
| diff | diferença entre versões | The diff is small. |
| patch | correção (aplicada) | The patch fixes the crash. |
| reviewer | revisor | The reviewer approved the change. |
| assignee | responsável (pela tarefa) | The assignee is Ana. |
| label | etiqueta | The PR has the bug label. |
| draft PR | PR em rascunho | This is a draft PR. |
| PR description | descrição do PR | The PR description explains the change. |
| commit message | mensagem do commit | The commit message is in English. |
| repository | repositório | The repository is on GitHub. |
| release branch | ramificação de versão | The release branch is ready. |

## Grupo C: Termos de revisão

| Termo | Significado no contexto | Exemplo |
|-------|-------------------------|---------|
| nit | detalhe pequeno | Just a nit: the name could be clearer. |
| nitpick | detalhe irrelevante | That's a nitpick, not a blocker. |
| suggestion | sugestão | I left a suggestion on line 10. |
| LGTM | parece bom (looks good to me) | LGTM, thanks for the fix. |
| looks good to me | parece bom | Looks good to me. |
| blocking | que impede a aprovação | This comment is blocking. |
| not blocking | que não impede | This is not blocking. |
| inline comment | comentário na linha | I left an inline comment. |
| change request | pedido de mudança | I'm sending a change request. |
| approval | aprovação | The PR needs one approval. |
| test coverage | cobertura de testes | The test coverage dropped. |
| failing check | verificação que falhou | The failing check is the lint. |
| green build | build aprovado | The build is green now. |
| edge case | caso limite | This is an edge case we missed. |
| regression | regressão (um problema novo) | The change caused a regression. |
| code smell | sinal de código ruim | This method is a code smell. |
| tech debt | dívida técnica | This adds tech debt. |
| typo | erro de digitação | There's a typo in the docs. |
| naming | nomenclatura | The naming is confusing. |
| readability | legibilidade | The readability is poor. |
| follow-up task | tarefa para depois | I'll open a follow-up task. |
| nice catch | bem pego | Nice catch on the null check. |
| minor | pequeno | It's a minor change. |
| major | grande | It's a major refactor. |
