FROM mcr.microsoft.com/mssql/server:2019-latest

USER root

COPY tools/devops/build/mssql/setup.sql setup.sql
COPY tools/devops/build/mssql/import-data.sh import-data.sh
COPY tools/devops/build/mssql/entrypoint.sh entrypoint.sh

RUN chmod +x import-data.sh
RUN chmod +x entrypoint.sh

CMD /bin/bash ./entrypoint.sh
