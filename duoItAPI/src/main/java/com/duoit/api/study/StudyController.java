package com.duoit.api.study;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.duoit.api.model.Rating;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/study")
public class StudyController {

	private final StudySessionService sessions;
	private final CardService cardService;

	public StudyController(StudySessionService sessions, CardService cardService) {
		this.sessions = sessions;
		this.cardService = cardService;
	}

	@GetMapping("/session")
	public List<CardView> session(@RequestParam("submodule") String submodule) {
		return sessions.sessionViews(Instant.now(), LocalDate.now(), submodule);
	}

	@PostMapping("/cards/{id}/answer")
	public ResponseEntity<Void> answer(@PathVariable Long id, @Valid @RequestBody AnswerRequest request) {
		boolean found = cardService.answer(id, request.rating(), Instant.now(), LocalDate.now());
		return found ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
	}

	public record AnswerRequest(@NotNull Rating rating) {
	}
}
