package tn.paiezone.rh;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.context.ImportTestcontainers;
import tn.paiezone.rh.config.AsyncSyncConfiguration;
import tn.paiezone.rh.config.DatabaseTestcontainer;
import tn.paiezone.rh.config.JacksonConfiguration;
import tn.paiezone.rh.config.RedisTestContainer;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
    classes = {
        PaieZoneRhApp.class,
        JacksonConfiguration.class,
        AsyncSyncConfiguration.class,
        tn.paiezone.rh.config.JacksonHibernateConfiguration.class,
    }
)
@ImportTestcontainers({ DatabaseTestcontainer.class, RedisTestContainer.class })
public @interface IntegrationTest {}
