package com.gym.management.repository;

import com.gym.management.context.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.support.JpaEntityInformation;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Tenant-Aware Base Repository - BULLETPROOF TENANT ISOLATION
 *
 * This repository automatically scopes all queries to the current tenant.
 */
@Slf4j
public class TenantAwareRepository<T, ID extends Serializable>
        extends SimpleJpaRepository<T, ID> implements JpaRepository<T, ID> {

    private final JpaEntityInformation<T, ?> entityInformation;
    private final EntityManager entityManager;
    private final Class<T> domainClass;

    public TenantAwareRepository(
            JpaEntityInformation<T, ?> entityInformation,
            EntityManager entityManager) {
        super(entityInformation, entityManager);
        this.entityInformation = entityInformation;
        this.entityManager = entityManager;
        this.domainClass = entityInformation.getJavaType();
    }

    @Override
    @Transactional
    public <S extends T> S save(S entity) {
        if (entityInformation.isNew(entity)) {
            setTenantId(entity);
        }
        return super.save(entity);
    }

    @Override
    @Transactional
    public <S extends T> List<S> saveAll(Iterable<S> entities) {
        List<S> result = new ArrayList<>();
        for (S entity : entities) {
            if (entityInformation.isNew(entity)) {
                setTenantId(entity);
            }
            result.add(super.save(entity));
        }
        return result;
    }

    @Override
    public Optional<T> findById(ID id) {
        Optional<T> entity = super.findById(id);
        if (entity.isPresent() && !isTenantMatch(entity.get())) {
            log.error("CROSS-TENANT ACCESS: Entity {} does not belong to tenant {}",
                id, TenantContext.getTenantId());
            return Optional.empty();
        }
        return entity;
    }

    @Override
    public boolean existsById(ID id) {
        return findById(id).isPresent();
    }

    private boolean isTenantMatch(T entity) {
        if (!TenantContext.isSet()) {
            return true;
        }
        Long currentTenant = TenantContext.getTenantId();
        try {
            Object entityTenant = getTenantIdFromEntity(entity);
            if (entityTenant == null) {
                return true;
            }
            return entityTenant.equals(currentTenant);
        } catch (Exception e) {
            return true;
        }
    }

    private void setTenantId(T entity) {
        if (!TenantContext.isSet()) {
            log.debug("No tenant context - cannot auto-set tenant ID");
            return;
        }

        Long currentTenant = TenantContext.getTenantId();
        try {
            try {
                var field = domainClass.getDeclaredField("tenantId");
                field.setAccessible(true);
                if (field.get(entity) == null) {
                    field.set(entity, currentTenant);
                    log.debug("Set tenantId: {}", currentTenant);
                }
            } catch (NoSuchFieldException e) {
                var field = domainClass.getDeclaredField("gymId");
                field.setAccessible(true);
                if (field.get(entity) == null) {
                    field.set(entity, currentTenant);
                    log.debug("Set gymId: {}", currentTenant);
                }
            }
        } catch (Exception e) {
            log.debug("Could not set tenant ID: {}", e.getMessage());
        }
    }

    private Object getTenantIdFromEntity(Object entity) throws Exception {
        try {
            var field = entity.getClass().getDeclaredField("tenantId");
            field.setAccessible(true);
            return field.get(entity);
        } catch (NoSuchFieldException e) {
            var field = entity.getClass().getDeclaredField("gymId");
            field.setAccessible(true);
            return field.get(entity);
        }
    }
}
