package br.com.agrotrack.agrotrack.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import br.com.agrotrack.agrotrack.model.Talhao;
import br.com.agrotrack.agrotrack.repository.TalhaoRepository;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@RequestMapping("/api/talhoes")
public class TalhaoController {
    private final TalhaoRepository repository;
    public TalhaoController(TalhaoRepository repository) { this.repository = repository; }

    @PostMapping
    public ResponseEntity<Talhao> criar(@RequestBody Talhao talhao) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(talhao));
    }

    @GetMapping
    public List<Talhao> listar() { return repository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Talhao> buscar(@PathVariable String id) {
        return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Talhao> atualizar(@PathVariable String id, @RequestBody Talhao dados) {
        return repository.findById(id).map(atual -> {
            atual.setNome(dados.getNome());
            atual.setCultura(dados.getCultura());
            atual.setAreaHectares(dados.getAreaHectares());
            atual.setObservacoes(dados.getObservacoes());
            return ResponseEntity.ok(repository.save(atual));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable String id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
