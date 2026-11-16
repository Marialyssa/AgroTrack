package br.com.agrotrack;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.mongodb.uri=mongodb://localhost:27017/AgroTrackTest")
class AgrotrackApplicationTests {

	@Test
	void contextLoads() {
	}

}
