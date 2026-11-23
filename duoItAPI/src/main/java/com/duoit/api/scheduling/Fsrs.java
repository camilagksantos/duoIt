package com.duoit.api.scheduling;

/**
 * Fórmulas do FSRS-5 com os pesos padrão e retenção desejada de 90%.
 *
 * Função pura, sem acesso ao banco nem ao relógio.
 * Os pesos são os padrão publicados para o FSRS-5. Qualquer ajuste de pesos deve ser
 * conferido contra uma implementação de referência.
 */
public final class Fsrs {

	/** Pesos padrão do FSRS-5 (w0 a w18). */
	static final double[] W = {
			0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616, 0.1544,
			1.0824, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407, 2.9466, 0.5034, 0.6567
	};

	static final double DECAY = -0.5;
	static final double FACTOR = 19.0 / 81.0;
	public static final double DESIRED_RETENTION = 0.9;
	static final double MIN_DIFFICULTY = 1.0;
	static final double MAX_DIFFICULTY = 10.0;
	static final long MAX_INTERVAL_DAYS = 36500;

	private Fsrs() {
	}

	/** Probabilidade de lembrar após {@code elapsedDays}, com estabilidade {@code stability}. */
	public static double retrievability(double elapsedDays, double stability) {
		return Math.pow(1 + FACTOR * elapsedDays / stability, DECAY);
	}

	/** Intervalo em dias até a retenção cair para a retenção desejada. */
	public static long intervalDays(double stability) {
		double days = stability / FACTOR * (Math.pow(DESIRED_RETENTION, 1 / DECAY) - 1);
		long rounded = Math.round(days);
		return Math.max(1, Math.min(MAX_INTERVAL_DAYS, rounded));
	}

	/** Estabilidade inicial para a primeira avaliação com a nota {@code grade} (1 a 4). */
	public static double initialStability(int grade) {
		return W[grade - 1];
	}

	/** Dificuldade inicial para a primeira avaliação com a nota {@code grade} (1 a 4). */
	public static double initialDifficulty(int grade) {
		return clampDifficulty(W[4] - Math.exp(W[5] * (grade - 1)) + 1);
	}

	/** Dificuldade após uma avaliação, com reversão para a média. */
	public static double nextDifficulty(double difficulty, int grade) {
		double delta = -W[6] * (grade - 3);
		double damped = difficulty + delta * (10 - difficulty) / 9;
		double reverted = W[7] * initialDifficulty(4) + (1 - W[7]) * damped;
		return clampDifficulty(reverted);
	}

	/** Estabilidade após lembrar (nota 2, 3 ou 4) em uma revisão. */
	public static double recallStability(double stability, double difficulty, double retrievability, int grade) {
		double hardPenalty = grade == 2 ? W[15] : 1;
		double easyBonus = grade == 4 ? W[16] : 1;
		double growth = Math.exp(W[8]) * (11 - difficulty) * Math.pow(stability, -W[9])
				* (Math.exp((1 - retrievability) * W[10]) - 1) * hardPenalty * easyBonus;
		return stability * (growth + 1);
	}

	/** Estabilidade após esquecer (nota 1) em uma revisão. Nunca passa da estabilidade anterior. */
	public static double forgetStability(double stability, double difficulty, double retrievability) {
		double next = W[11] * Math.pow(difficulty, -W[12])
				* (Math.pow(stability + 1, W[13]) - 1)
				* Math.exp((1 - retrievability) * W[14]);
		return Math.min(next, stability);
	}

	static double clampDifficulty(double value) {
		return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, value));
	}
}
