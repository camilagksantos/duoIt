package com.duoit.api.study;

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

	public StudyController(StudySessionService sessions) {
		this.sessions = sessions;
	}

	@GetMapping("/session")
	public List<CardView> session(@RequestParam("submodule") String submodule) {
		return sessions.sessionViews(LocalDate.now(), submodule);
	}

	@PostMapping("/cards/{id}/answer")
	public ResponseEntity<Void> answer(@PathVariable Long id, @Valid @RequestBody AnswerRequest request) {
		boolean found = sessions.answer(id, request.rating(), LocalDate.now());
		return found ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
	}

	public record AnswerRequest(@NotNull Rating rating) {
	}
}
