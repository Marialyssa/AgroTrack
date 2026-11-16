package br.com.agrotrack.agrotrack.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import br.com.agrotrack.agrotrack.model.Ocorrencia;

public interface OcorrenciaRepository extends MongoRepository<Ocorrencia, String> {
}
