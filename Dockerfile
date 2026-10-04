FROM yamlresume/yamlresume-base:v2.0.0

LABEL maintainer="YAMLResume <https://yamlresume.dev>"

RUN npm install -g yamlresume@latest && npm cache clean --force

RUN useradd -m -u 2048 yamlresume
RUN usermod -aG node yamlresume

USER yamlresume

WORKDIR /home/yamlresume

ENTRYPOINT ["yamlresume"]

CMD ["help"]