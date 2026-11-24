package com.duoit.api.review;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.duoit.api.study.CardService;
import com.duoit.api.study.CardView;
import com.duoit.api.study.StudyController.AnswerRequest;
import com.duoit.api.study.StudyController.AnswerResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

	private final ReviewSessionService sessions;
	private final CardService cardService;

	public ReviewController(ReviewSessionService sessions, CardService cardService) {
		this.sessions = sessions;
		this.cardService = cardService;
	}

	/** Revisão diária: vencidos pelo agendamento e novos do dia. */
	@GetMapping("/session")
	public List<CardView> session() {
		return sessions.sessionViews(Instant.now(), LocalDate.now());
	}

	/** Revisão geral: todas as palavras marcadas, sem filtro de data. */
	@GetMapping("/all")
	public List<CardView> all() {
		return sessions.allViews(Instant.now());
	}

	/** Avaliação no Review. Atualiza o agendamento, mas não conta para o progresso do curso. */
	@PostMapping("/cards/{id}/answer")
	public ResponseEntity<AnswerResponse> answer(@PathVariable Long id, @Valid @RequestBody AnswerRequest request) {
		return cardService.answer(id, request.rating(), Instant.now(), LocalDate.now(), false)
				.map(next -> ResponseEntity.ok(new AnswerResponse(next)))
				.orElseGet(() -> ResponseEntity.notFound().build());
	}
}
