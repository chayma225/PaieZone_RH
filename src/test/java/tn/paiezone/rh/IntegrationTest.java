package tn.paiezone.rh;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;
import tn.paiezone.rh.config.AsyncSyncConfiguration;
import tn.paiezone.rh.config.EmbeddedKafka;
import tn.paiezone.rh.config.EmbeddedRedis;
import tn.paiezone.rh.config.EmbeddedSQL;
import tn.paiezone.rh.config.JacksonConfiguration;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(classes = { PaieZoneRhApp.class, JacksonConfiguration.class, AsyncSyncConfiguration.class })
@EmbeddedRedis
@EmbeddedSQL
@EmbeddedKafka
public @interface IntegrationTest {
}
