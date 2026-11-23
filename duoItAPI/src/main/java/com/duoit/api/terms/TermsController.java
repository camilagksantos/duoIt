package com.duoit.api.terms;

import java.time.Instant;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.duoit.api.terms.TermsService.TermsResponse;

@RestController
@RequestMapping("/api/terms")
public class TermsController {

	private final TermsService terms;

	public TermsController(TermsService terms) {
		this.terms = terms;
	}

	@GetMapping
	public ResponseEntity<TermsResponse> terms(@RequestParam("submodule") String submodule) {
		return terms.terms(submodule).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	/** Conclui os termos do grupo e inclui as palavras no Cards Review. */
	@PostMapping("/complete")
	public ResponseEntity<Void> complete(@RequestParam("submodule") String submodule) {
		boolean found = terms.complete(submodule, Instant.now());
		return found ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
	}
}
