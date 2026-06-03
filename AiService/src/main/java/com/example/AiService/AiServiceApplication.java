package com.example.AiService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AiServiceApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(AiServiceApplication.class, args);
	}

	private static void loadDotEnv() {
		Path envPath = findDotEnv();
		if (envPath == null) {
			return;
		}

		try (Stream<String> lines = Files.lines(envPath)) {
			lines.map(String::trim)
					.filter(line -> !line.isEmpty() && !line.startsWith("#"))
					.filter(line -> line.contains("="))
					.forEach(line -> {
						String[] parts = line.split("=", 2);
						String key = parts[0].trim();
						String value = stripWrappingQuotes(parts[1].trim());
						if (!key.isEmpty()
								&& System.getenv(key) == null
								&& System.getProperty(key) == null) {
							System.setProperty(key, value);
						}
					});
		} catch (IOException ignored) {
			// Spring will report unresolved placeholders if required values are absent.
		}
	}

	private static Path findDotEnv() {
		Path current = Path.of("").toAbsolutePath();
		for (int i = 0; i < 4 && current != null; i++) {
			Path candidate = current.resolve(".env");
			if (Files.isRegularFile(candidate)) {
				return candidate;
			}
			current = current.getParent();
		}
		return null;
	}

	private static String stripWrappingQuotes(String value) {
		if (value.length() >= 2) {
			char first = value.charAt(0);
			char last = value.charAt(value.length() - 1);
			if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
				return value.substring(1, value.length() - 1);
			}
		}
		return value;
	}
}
