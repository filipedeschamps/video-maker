# video-maker
Projeto open source para fazer vídeos automatizados

# Pré requisitos

- Git (https://git-scm.com/)
- Node (https://nodejs.org)

# Instalação

Por [Hebert Lima](https://github.com/hebertlima)

Estou vendo que alguns devs aqui estão com problemas para rodar o projeto, talvez por que alguns não estão acompanhando a serie no [YouTube](https://www.youtube.com/watch?v=kjhu1LEmRpY&list=PLMdYygf53DP4YTVeu0JxVnWq01uXrLwHi) e por pegarem o "bonde andando" estão pulando algumas etapas do projeto e indo direto para o `node index.js`, então aqui vai a transcrição do passo-a-passo (que está sendo explicado nos vídeos) detalhado de como rodar o projeto para os desavisados de primeira viagem :stuck_out_tongue_winking_eye:

## Start ##
Vou partir do princípio que você caiu na playlist e é aspirantes a programação e não está familiarizados com o **Git** ou **Node.js**, então primeiro você precisa instalar o [Node.js](https://nodejs.org/en/) no seu pc e seguir o procedimento padrão de instalação **next->next->ok**, recomendo você baixar o [Git](https://git-scm.com/downloads) e instalar na sua maquina, depois basta copiar a URL do projeto conforme abaixo:

![Start](https://i.imgsafe.org/cb/cb0daa65df.gif)

## Clonando o Repositório ##
Com o Git e o Node.js instalado na sua maquina e a **URL** do projeto em mãos, cria em algum lugar do seu pc uma pasta para criarmos uma copia do repositório, dentro dela abra o **cmd** ou **powershell** e digite os comandos abaixo:
```
git clone https://github.com/filipedeschamps/video-maker.git
cd video-maker
npm install
```

![Clone](https://i.imgsafe.org/ca/caed010086.gif)

## Api: Algorithmia ##
É necessário criar a sua chave de acesso para poder testar os robôs, pra isso você precisa acessar o site do [Algorithmia](https://algorithmia.com/), aqui não tem muito segredo, basta acessar e se cadastrar, depois de logar na sua conta, na Dashboard procure no menu **Api Keys** e **copie**.

![Algorithmin](https://i.imgsafe.org/ba/ba1d23897c.gif)

vá até a pasta do projeto onde você clonou o repositório, navegue até a pasta **video-maker\credentials**, crie um arquivo de texto e renomeie para `algorithmia.json`, dentro desse arquivo você irá colocar a `API` que copiou do site **Algorithmia** na estrutura abaixo:
``` js
{
  "apiKey": "API_KEY_AQUI"
}
```

## Api: Watson ##
Você precisa criar também as credenciais do *Watson* no site da [IBM](https://cloud.ibm.com/login), também não tem segredo, basta se cadastrar, quando estiver logado no menu superior clique em **Catálogo**, depois dentro de **IA** procure por *Natural Language Understanding*

![IBM](https://i.imgsafe.org/ba/bab0fc4ecd.jpeg)

clicando nele na nova página vai aparece um botão "criar" no final da página, uma vez que o serviço for criado, você será redirecionado para a página de gerenciamento do serviço que você acabou de criar, no menu lateral esquerdo procure por **Credenciais de Serviços** e depois clique em **Auto-generated service credentials** destacado abaixo, então copie as *Credenciais*:

![IBM](https://i.imgsafe.org/ba/bace46f16b.jpeg)

Novamente, voltando na pasta do projeto ainda dentro da pasta **video-maker\credentials** você ira criar um novo arquivo de texto com o nome `watson-nlu.json` e dentro desse arquivo você vai colar as credenciais que copiou anteriormente:
``` js
{
  "apikey" : "...",
  "iam_apikey_description" : "...",
  "iam_apikey_name": "...",
  "iam_role_crn": "...",
  "iam_serviceid_crn": "...",
  "url": "..."
}
```

## Setup: Google Cloud Plataform ##
Antes de criarmos as api's que iremos utilizar é necessário vincular a nossa conta do Google com o [Google Cloud Plataform](https://cloud.google.com/), na página do **Google Cloud Plataform** você irá clicar no botão **Faça uma Avaliação Gratuita**:

![google-cloud](https://i.imgsafe.org/61/61ce83ca22.png)

 em seguida marque a opção **Termos e Condições**

![google-cloud-step1](https://i.imgsafe.org/62/621a2df511.png)

> Ps.: É importante lembrar que alguns recursos do **Google Cloud Plataform** são **Pagos**, por esse motivo é necessário inserir as informações de pagamento, mas fique tranquilo porque iremos utilizar apenas os recursos **Gratuitos**

![google-cloud-pay](https://i.imgsafe.org/62/6253ce8142.jpeg)

## Criando o Projeto ##

Agora é a hora de criarmos um projeto que iremos vincular as Api's que vamos utilizar, para isso basta clicar no menu do topo da página "**Selecionar projeto**" e depois em "**Novo Projeto**":

![image](https://user-images.githubusercontent.com/34013325/55571155-52e3d400-56db-11e9-998f-bd99ab647403.png)

de um nome ao projeto e clique no botão **criar:**

![image](https://user-images.githubusercontent.com/34013325/55571267-963e4280-56db-11e9-9b21-7f028caa05c1.png)

após isso o projeto começará a ser criado e assim que terminar um menu vai aparecer com o projeto que acabamos de criar então você irá seleciona-lo:

![image](https://user-images.githubusercontent.com/34013325/55571506-064cc880-56dc-11e9-804b-f14003dccc09.png)

## Api: Custom Search API ##

Com o projeto criado agora é hora de habilitarmos e configurarmos a Api, você irá clicar no menu lateral esquerdo no topo navegar até **API's e Serviços** > **Bibliotecas**:

![image](https://user-images.githubusercontent.com/34013325/55572521-22ea0000-56de-11e9-89cc-f477fe18bf65.png)

no campo de pesquisa basta procurar por **Custom Search API**, clicar em **Ativar**, e aguardar até a ativação da api:

![image](https://user-images.githubusercontent.com/34013325/55572661-78bea800-56de-11e9-9ae3-fbc87758aa84.png)

Após a ativação vai aparecer uma mensagem solicitando a criação das credenciais da API, então basta você clicar em **Criar Credenciais**:

![image](https://user-images.githubusercontent.com/34013325/55572835-eb2f8800-56de-11e9-8292-fc3c4bf74084.png)

Procure por **Custom Search API** no dropdown e clique em "**Preciso de quais credenciais?**"

![image](https://user-images.githubusercontent.com/34013325/55572958-2cc03300-56df-11e9-8bc1-17641ba5138e.png)

Após isso irá aparecer sua Api Key, você vai copia-la e clicar no botão concluir, voltando a pasta do projeto você vai navegar até **video-maker/credentials** e irá criar um novo arquivo chamado **google-search.json** com o conteúdo abaixo:

```
{
  "apiKey": "API_KEY_AQUI"
}
```

## Api: Custom Search Enginer ##
Agora iremos configurar o nosso motor de busca personalizado do google, para isso você vai acessar o [Custom Search Engine](https://cse.google.com/cse/create/new), e irá informar o **site a pesquisar** coloque **google.com**, ire selecionar o idioma que preferir *no vídeo o Filipe deixa Inglês então aconselho deixar em inglês*, e por fim clique em **Opções avançadas** e para o esquema iremos utilizar o mais genérico **Thing**, pronto tudo preenchido você irá clicar em **criar**:

> PS.: Para saber mais sobre o schema que o Filipe cita no vídeo acesse [schema.org](https://schema.org/docs/full.html)

![image](https://user-images.githubusercontent.com/34013325/55578410-38662680-56ec-11e9-80ea-06ff9e25ba3f.png)


Agora basta clicar em **Painel de Controle** na nova tela nós iremos habilitar a opção **Pesquisa de imagens** e depois iremos clicar no botão **Copiar para área de transferência**"

![image](https://user-images.githubusercontent.com/34013325/55574756-8a567e80-56e3-11e9-99ea-d307547c781f.png)

> Ps.: Existem diversas opções que eu aconselho futuramente você testar e descobrir o que cada uma dela faz 😋 

![image](https://user-images.githubusercontent.com/34013325/55574920-0355d600-56e4-11e9-8f36-822a62224fab.png)

Voltando no arquivo **google-search.json** iremos criar uma nova propriedade e iremos colar o código identificador do mecanismo de busca que criamos, identificado por `searchEngineId`, no final irá ficar assim:

```
{
  "apiKey": "API_KEY_AQUI"
  "searchEngineId": "ID_MECANISMO_DE_BUSCA"
}
```

> PS.: esse tutorial funciona até o e ultimo video publicado pelo Filipe (commit #82) para clonar a partir desse commit use o comando`git checkout 708632a06ecd35f7e7db96faf8adca7e7e717a0e` conforme os videos forem saindo irei atualizando 😇 

## 1.., 2..., 3... Testando! ##
Agora dentro da pasta **video-maker** você pode abrir o **cmd** ou **powershell** e executar o comando:
```
node index.js
```
![ezgif-5-924644a4b21d](https://user-images.githubusercontent.com/34013325/55579383-79f7d100-56ee-11e9-9bba-b92704a85b08.gif)


