package br.com.agrotrack.agrotrack.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import br.com.agrotrack.agrotrack.model.Talhao;

public interface TalhaoRepository extends MongoRepository<Talhao, String> {}
