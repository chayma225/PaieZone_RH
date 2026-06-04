package tn.paiezone.rh.config;

import java.net.URI;
import java.util.concurrent.TimeUnit;
import javax.cache.configuration.MutableConfiguration;
import javax.cache.expiry.CreatedExpiryPolicy;
import javax.cache.expiry.Duration;
import org.hibernate.cache.jcache.ConfigSettings;
import org.redisson.Redisson;
import org.redisson.config.ClusterServersConfig;
import org.redisson.config.Config;
import org.redisson.config.SingleServerConfig;
import org.redisson.jcache.configuration.RedissonConfiguration;
import org.springframework.boot.cache.autoconfigure.JCacheManagerCustomizer;
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Configuration;
import tech.jhipster.config.JHipsterProperties;

@Configuration
@EnableCaching
public class CacheConfiguration {

    @Bean
    public javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration(JHipsterProperties jHipsterProperties) {
        MutableConfiguration<Object, Object> jcacheConfig = new MutableConfiguration<>();

        URI redisUri = URI.create(jHipsterProperties.getCache().getRedis().getServer()[0]);

        Config config = new Config();
        // Fix Hibernate lazy initialization https://github.com/jhipster/generator-jhipster/issues/22889
        config.setCodec(new org.redisson.codec.SerializationCodec());
        if (jHipsterProperties.getCache().getRedis().isCluster()) {
            ClusterServersConfig clusterServersConfig = config
                .useClusterServers()
                .setMasterConnectionPoolSize(jHipsterProperties.getCache().getRedis().getConnectionPoolSize())
                .setMasterConnectionMinimumIdleSize(jHipsterProperties.getCache().getRedis().getConnectionMinimumIdleSize())
                .setSubscriptionConnectionPoolSize(jHipsterProperties.getCache().getRedis().getSubscriptionConnectionPoolSize())
                .addNodeAddress(jHipsterProperties.getCache().getRedis().getServer());

            if (redisUri.getUserInfo() != null) {
                clusterServersConfig.setPassword(redisUri.getUserInfo().substring(redisUri.getUserInfo().indexOf(':') + 1));
            }
        } else {
            SingleServerConfig singleServerConfig = config
                .useSingleServer()
                .setConnectionPoolSize(jHipsterProperties.getCache().getRedis().getConnectionPoolSize())
                .setConnectionMinimumIdleSize(jHipsterProperties.getCache().getRedis().getConnectionMinimumIdleSize())
                .setSubscriptionConnectionPoolSize(jHipsterProperties.getCache().getRedis().getSubscriptionConnectionPoolSize())
                .setAddress(jHipsterProperties.getCache().getRedis().getServer()[0]);

            if (redisUri.getUserInfo() != null) {
                singleServerConfig.setPassword(redisUri.getUserInfo().substring(redisUri.getUserInfo().indexOf(':') + 1));
            }
        }
        jcacheConfig.setStatisticsEnabled(true);
        jcacheConfig.setExpiryPolicyFactory(
            CreatedExpiryPolicy.factoryOf(new Duration(TimeUnit.SECONDS, jHipsterProperties.getCache().getRedis().getExpiration()))
        );
        return RedissonConfiguration.fromInstance(Redisson.create(config), jcacheConfig);
    }

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(javax.cache.CacheManager cm) {
        return hibernateProperties -> hibernateProperties.put(ConfigSettings.CACHE_MANAGER, cm);
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer(javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration) {
        return cm -> {
            createCache(cm, tn.paiezone.rh.repository.UserRepository.USERS_BY_LOGIN_CACHE, jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.repository.UserRepository.USERS_BY_EMAIL_CACHE, jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.User.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.Authority.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.User.class.getName() + ".authorities", jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.Company.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.CompanySubscription.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.UserProfile.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.AuditLog.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.Department.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.JobPosition.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.Employee.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.Contract.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.HrDocument.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.EmployeeHistory.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.LeaveType.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.LeaveRequest.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.LeaveBalance.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.PublicHoliday.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.TimeEntry.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.PayrollPeriod.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.Rubrique.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.PaySlip.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.PaySlipLine.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.Bonus.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.Advance.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.RegulatoryParam.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.TaxBracket.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.CnssRate.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.AccountPlan.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.AccountingEntry.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.OfficialDocument.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.ChatSession.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.ChatMessage.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.KnowledgeDocument.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.SocialDeclaration.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.SocialDeclaration.class.getName() + ".lines", jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.SocialDeclarationLine.class.getName(), jcacheConfiguration);
            createCache(cm, tn.paiezone.rh.domain.ChatbotAction.class.getName(), jcacheConfiguration);
            // jhipster-needle-redis-add-entry
        };
    }

    private void createCache(
        javax.cache.CacheManager cm,
        String cacheName,
        javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration
    ) {
        // Always destroy then recreate to clear any stale Redis data across restarts
        try {
            cm.destroyCache(cacheName);
        } catch (Exception ignored) {}
        cm.createCache(cacheName, jcacheConfiguration);
    }
}
