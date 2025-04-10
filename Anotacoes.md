POSTGRESSQL

1 - verificar se o postgreSQL está instalado -> sudo systemctl status postgresql
2 - criação do banco de dados -> sudo -u postgres createdb bi
3 - exemplo do arquivo de restauração do banco de dados -> sudo -u postgres psql bi < "/home/mauricio/PROJETOS DATA CONPANY/BD_BI/dump-bi-202504031347.sql"
    // caso não der certo de restaurauração personalizada, tente isto -> sudo -u postgres pg_restore -d bi "/home/mauricio/PROJETOS DATA CONPANY/BD_BI/dump-bi-202504031347.sql"
    // se der problema de permissão dar o comando -> 
    sudo mkdir -p /tmp/pgdump
    sudo chmod 777 /tmp/pgdump

    e

    # Copiar o arquivo para esse diretório
    sudo cp "/home/mauricio/PROJETOS DATA CONPANY/BD_BI/dump-bi-202504031347.sql" /tmp/pgdump/

    # Restaurar a partir desse local
    sudo -u postgres pg_restore -d bi "/tmp/pgdump/dump-bi-202504031347.sql" ao dar esse comando o banco de dados vai ser restaurado.
    
    # Verificar se as tabelas foram criadas (substituindo 'ten_zoffi' por um dos esquemas mencionados nos erros)
    sudo -u postgres psql -d bi -c "\dn"

    PARA DAR RUN:
    BACKEND - npm run start:dev
    FRONTEND - npx quasar dev
    versão node - 16.20.2