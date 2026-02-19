package com.medication.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class MedicationSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(MedicationSystemApplication.class, args);
	}

}
