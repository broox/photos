FROM python:3.7
COPY ./server /app
COPY requirements.txt /app/
WORKDIR /app
RUN pip3 install --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade pip
RUN pip3 install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
# CMD python3 /app/app.py