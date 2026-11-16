# AgroTrack

Aplicação acadêmica para organizar talhões e ocorrências agrícolas. O projeto usa React/Vite no frontend, Java 21 com Spring Boot no backend e MongoDB para persistência. O assistente consulta os registros e usa OpenRouter para gerar respostas.

## Requisitos

- Node.js e npm
- Java 21
- Acesso a uma instância MongoDB
- Chave OpenRouter para habilitar o assistente (opcional para o CRUD)

## Configuração do backend

Na pasta `agrotrack`, defina `MONGODB_URI` no ambiente. Para usar o assistente, defina também `OPENROUTER_API_KEY`. Não coloque esses valores nos arquivos do projeto.

```bash
cd agrotrack
export MONGODB_URI='mongodb+srv://<usuario>:<senha>@<cluster>/<banco>'
export OPENROUTER_API_KEY='<sua-chave>'
./mvnw spring-boot:run
```

## Configuração do frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra o endereço local exibido pelo Vite (normalmente `http://localhost:5173`). O backend atende em `http://localhost:8080`.

## Recursos

- Cadastro, consulta, edição e exclusão de ocorrências e talhões.
- Indicadores e relatórios calculados a partir dos registros.
- Assistente de consulta aos dados, sem alterar documentos do banco.

O painel contém indicadores demonstrativos onde ainda não há integração com dados externos. As respostas de manejo do assistente são apoio informativo e devem ser validadas por profissional habilitado.
