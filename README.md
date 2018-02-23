# README v.1.1

# Bioteca Baependi

## Uso

Aplicação desenvolvida para utilização no Laboratório de genética e cardiologia molecular do Instituto do Coração (INCOR) 
HC/FMUSP - São Paulo.


## Colaboradores

Denys Wylliam da Silva < **denys.wylliam@gmail.com** >

## Configurações e Instalação ##

* Fazer download do node.js

        $ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

* Instalar o node

        $ sudo apt-get install -y nodejs

* Instalar o pacote adicional 

        $ sudo apt-get install -y build-essential

* Fazer o download do MongoDb

        $ curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-3.4.6.tgz

* Descompactar

        $ tar -zxvf mongodb-linux-x86_64-3.4.6.tgz

* Criar diretório do Mongo

        $ mkdir -p mongodb

* Copiar executavel para o diretorio

        $ cp -R -n mongodb-linux-x86_64-3.4.6/ mongodb

* Criar diretório onde ficarão armazenados os dados

        $ mkdir -p /data/db

* Dar permissão de leitura e escrita no diretório acima.

        $ chmod 766 /data/db 

* Iniciar o servidor MongoDB

        $ sudo systemctl start mongod.service

* Iniciar o shell do Mongo

        $ mongo

* Criar a base de dados da aplicação

        > use bioteca

* Depois de ter feito o download da aplicação, entre no diretório da aplicação e instale as dependências:

        $ sudo npm install

* execute com:

        $ node SysBioteca.js

* O sistema estará sendo executado na porta 8080 com o seguite caminho:
localhost:8080/login

* Modifique o tipo de acesso de usuário para '2' dentro do banco para ter acesso de administrador e poder dar acesso a outras contas e ter acesso a outras funções do sistema.


### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.