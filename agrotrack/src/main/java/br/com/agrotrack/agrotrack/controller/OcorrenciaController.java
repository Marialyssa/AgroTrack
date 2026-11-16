package br.com.agrotrack.agrotrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.agrotrack.agrotrack.model.Ocorrencia;
import br.com.agrotrack.agrotrack.repository.OcorrenciaRepository;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@RequestMapping("/api/ocorrencias")
public class OcorrenciaController {

	private final OcorrenciaRepository ocorrenciaRepository;

	public OcorrenciaController(OcorrenciaRepository ocorrenciaRepository) {
		this.ocorrenciaRepository = ocorrenciaRepository;
	}

	@PostMapping
	public ResponseEntity<Ocorrencia> criar(@RequestBody Ocorrencia ocorrencia) {
		Ocorrencia ocorrenciaSalva = ocorrenciaRepository.save(ocorrencia);
		return ResponseEntity.status(HttpStatus.CREATED).body(ocorrenciaSalva);
	}

	@GetMapping
	public List<Ocorrencia> listarTodas() {
		return ocorrenciaRepository.findAll();
	}

	@GetMapping("/{id}")
	public ResponseEntity<Ocorrencia> buscarPorId(@PathVariable String id) {
		return ocorrenciaRepository.findById(id)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}
	@PutMapping("/{id}")
	public ResponseEntity<Ocorrencia> atualizar(@PathVariable String id, @RequestBody Ocorrencia dados) {
		return ocorrenciaRepository.findById(id).map(atual -> {
			atual.setNomeTalhao(dados.getNomeTalhao());
			atual.setCultura(dados.getCultura());
			atual.setDoenca(dados.getDoenca());
			atual.setSeveridade(dados.getSeveridade());
			atual.setDataOcorrencia(dados.getDataOcorrencia());
			atual.setObservacoes(dados.getObservacoes());
			return ResponseEntity.ok(ocorrenciaRepository.save(atual));
		}).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> excluir(@PathVariable String id) {
		if (!ocorrenciaRepository.existsById(id)) return ResponseEntity.notFound().build();
		ocorrenciaRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
