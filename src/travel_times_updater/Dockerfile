FROM python:3.6-slim

RUN apt-get update
RUN apt-get install -y build-essential

ADD requirements.txt /tmp/requirements.txt

RUN pip install -r /tmp/requirements.txt

ENV PYTHONPATH=.:$PYTHONPATH
ENV WORKERS=4
ENV PORT=5000

ADD . /app
WORKDIR /app

CMD python update.py
