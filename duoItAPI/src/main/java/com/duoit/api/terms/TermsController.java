package com.duoit.api.terms;

import java.time.Instant;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.duoit.api.terms.TermsService.TermView;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/terms")
public class TermsController {

	private final TermsService terms;

	public TermsController(TermsService terms) {
		this.terms = terms;
	}

	@GetMapping
	public List<TermView> terms(@RequestParam("submodule") String submodule) {
		return terms.terms(submodule);
	}

	@PutMapping("/{wordId}/learned")
	public ResponseEntity<Void> setLearned(@PathVariable Long wordId, @Valid @RequestBody LearnedRequest request) {
		boolean found = terms.setLearned(wordId, request.learned(), Instant.now());
		return found ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
	}

	public record LearnedRequest(@NotNull Boolean learned) {
	}
}
