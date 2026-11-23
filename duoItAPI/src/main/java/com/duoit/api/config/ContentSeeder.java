package com.duoit.api.config;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import com.duoit.api.model.Card;
import com.duoit.api.model.LearningModule;
import com.duoit.api.model.Submodule;
import com.duoit.api.model.Word;
import com.duoit.api.repository.CardRepository;
import com.duoit.api.repository.LearningModuleRepository;
import com.duoit.api.repository.SubmoduleRepository;
import com.duoit.api.repository.WordRepository;

import tools.jackson.databind.ObjectMapper;

/**
 * Sincroniza o conteúdo de resources/content/*.json com o banco, a cada inicialização.
 *
 * - Módulo, grupo e palavra novos são criados.
 * - Título, posição, significado e exemplo são atualizados quando mudam no JSON.
 * - Palavras que saíram do JSON não são apagadas. Os cards delas, e o progresso, continuam no banco.
 * - Cards não são tocados aqui: eles são criados depois, pelo CardProvisioner.
 */
@Component
public class ContentSeeder implements ApplicationRunner {

	private final LearningModuleRepository modules;
	private final SubmoduleRepository submodules;
	private final WordRepository words;
	private final ObjectMapper mapper;
	private final TransactionTemplate tx;
	private final CardRepository cards;

	public ContentSeeder(LearningModuleRepository modules, SubmoduleRepository submodules,
			WordRepository words, ObjectMapper mapper, TransactionTemplate tx, CardRepository cards) {
		this.modules = modules;
		this.submodules = submodules;
		this.words = words;
		this.mapper = mapper;
		this.tx = tx;
		this.cards = cards;
	}

	@Override
	public void run(ApplicationArguments args) throws IOException {
		Resource[] resources = new PathMatchingResourcePatternResolver().getResources("classpath:content/*.json");
		Arrays.sort(resources, Comparator.comparing(Resource::getFilename));

		for (Resource resource : resources) {
			ContentFile content;
			try (InputStream in = resource.getInputStream()) {
				content = mapper.readValue(in, ContentFile.class);
			}
			// Uma transação por módulo: as entidades lidas ficam gerenciadas até o commit.
			tx.executeWithoutResult(status -> syncModule(content));
		}
	}

	private void syncModule(ContentFile content) {
		LearningModule module = modules.findByTitle(content.module().title())
				.orElseGet(() -> modules.save(new LearningModule(content.module().title(), content.module().position())));

		for (SubmoduleFile sub : content.submodules()) {
			Submodule submodule = submodules.findBySlug(sub.slug())
					.orElseGet(() -> submodules.save(new Submodule(sub.slug(), sub.title(), sub.position(), module)));
			submodule.update(sub.title(), sub.position());

			for (WordFile word : sub.words()) {
				words.findBySubmoduleAndTerm(submodule, word.term())
						.ifPresentOrElse(
								existing -> existing.update(word.meaning(), word.example()),
								() -> words.save(new Word(word.term(), word.meaning(), word.example(), submodule)));
			}

			// Grupo já concluído: palavras novas do JSON entram no Review automaticamente.
			if (submodule.isCompleted()) {
				for (Word word : words.findBySubmoduleSlugOrderByIdAsc(sub.slug())) {
					if (cards.findByWord(word).isEmpty()) {
						cards.save(new Card(word, Instant.now()));
					}
				}
			}
		}
	}

	record ContentFile(ModuleFile module, List<SubmoduleFile> submodules) {
	}

	record ModuleFile(String title, int position) {
	}

	record SubmoduleFile(String slug, String title, int position, List<WordFile> words) {
	}

	record WordFile(String term, String meaning, String example) {
	}
}
