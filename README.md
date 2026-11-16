# AgroTrack

Aplicação acadêmica de gestão agrícola com interface React/Vite, API Java/Spring Boot, persistência MongoDB e assistente OpenRouter.

## Conteúdo

O repositório inclui os códigos-fonte e também os documentos, arquivos de build e dependências locais que estavam na pasta do projeto quando ele foi publicado. Credenciais e arquivos locais de ambiente não são incluídos.

## Executar

Pré-requisitos: Node.js/npm, Java 21 e uma conexão MongoDB.

No terminal do backend, configure as variáveis de ambiente sem gravar os valores nos arquivos do projeto:

```bash
cd agrotrack
export MONGODB_URI='mongodb+srv://<usuario>:<senha>@<cluster>/<banco>'
export OPENROUTER_API_KEY='<sua-chave>'
./mvnw spring-boot:run
```

Em outro terminal, inicie o frontend:

```bash
cd frontend
npm run dev
```

Abra o endereço local informado pelo Vite, normalmente `http://localhost:5173`. O backend atende na porta `8080`.

## Funcionalidades

- Cadastro, consulta, edição e exclusão de talhões e ocorrências.
- Indicadores e relatórios calculados com base nos registros.
- Assistente que consulta os registros e não altera o banco.

Os dados do painel que não vêm dos registros estão identificados como demonstrativos. Sugestões do assistente são informativas e devem ser validadas por profissional habilitado.
