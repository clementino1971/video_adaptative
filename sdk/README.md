# sdk
## Bora.
## Tutorial
* Importante que frontend e esdk deve estar no mesmo nível.
* Clonar o repossitório do jeliel em que ele colocou tudo.
* No frontend, no index.html coloca:
> <script>src = "[novo_nome]"<\script>.

* No package.json, em compile 2 coloca o [novo-nome].
* suas alterações devem estar em dist2/myapp.js
* Mudar email e password em myapp.js de acordo com as regras do Cesar.
* Executar na pasta sdk:
> npm install
> npm run compile1
> npm run compile2

* No evaluator.evaluate eu ponho o algoritmo de adaptação.
* Sempre que mudar algum arquivo tem que dar o compile2, caso seja JS.
 * Se for ts, roda o compile1 antes.

* Já está com a banda atual, aí preciso pesquisar para pôr o bufer e outras.
* Nos eventos de log, verificar se o Logger tá setado, como o primeiro.
* Quando tiver pronto, altera a url no enviroment.js para poder falar com a API direito.
* Podem ignorar os erros que irão aparecer com os comandos: npm install, npm run compile1, npm run compile2, mesmo com os erros, o arquivo novoscript.js será gerado normalmente! :)
