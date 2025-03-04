# Etapa 1: Construção do Angular
FROM node:20 AS build-stage

# Define o diretório de trabalho
WORKDIR /app

# Copia todos os arquivos do projeto para o container
COPY . .

# Instala o Angular CLI globalmente (caso ainda não esteja instalado no projeto)
RUN npm install -g @angular/cli

# Instala as dependências do projeto
RUN npm install

# Faz o build otimizado para produção (usa a configuração 'production' definida no angular.json)
RUN ng build

# Etapa 2: Servindo a aplicação com Nginx
FROM nginx:latest AS production-stage

# Remove a configuração padrão do Nginx para evitar conflitos
RUN rm /etc/nginx/conf.d/default.conf

# Copia o build do Angular para o diretório padrão do Nginx
COPY --from=build-stage /app/dist/gerenciador-escola-front /usr/share/nginx/html

# Copia a configuração customizada do Nginx (certifique-se de que o arquivo nginx.conf esteja na raiz do projeto)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 para acesso à aplicação
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]