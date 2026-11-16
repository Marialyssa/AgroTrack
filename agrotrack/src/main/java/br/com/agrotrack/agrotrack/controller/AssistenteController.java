package br.com.agrotrack.agrotrack.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import br.com.agrotrack.agrotrack.model.AssistentePergunta;
import br.com.agrotrack.agrotrack.model.AssistenteResposta;
import br.com.agrotrack.agrotrack.service.AssistenteService;
import br.com.agrotrack.agrotrack.service.AssistenteService.AssistenteIndisponivelException;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@RequestMapping("/api/assistente")
public class AssistenteController {
    private final AssistenteService service;
    public AssistenteController(AssistenteService service) { this.service = service; }

    @PostMapping("/perguntar")
    public ResponseEntity<?> perguntar(@RequestBody AssistentePergunta pedido) {
        String pergunta = pedido == null || pedido.pergunta() == null ? "" : pedido.pergunta().trim();
        if (pergunta.isBlank() || pergunta.length() > 500) {
            return ResponseEntity.badRequest().body(new Erro("Escreva uma pergunta com até 500 caracteres."));
        }
        try {
            AssistenteResposta resposta = service.perguntar(pergunta);
            return ResponseEntity.ok(resposta);
        } catch (AssistenteIndisponivelException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Erro(e.getMessage()));
        }
    }

    public record Erro(String erro) {}
}
