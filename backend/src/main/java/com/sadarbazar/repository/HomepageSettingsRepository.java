package com.sadarbazar.repository;

import com.sadarbazar.entity.HomepageSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface HomepageSettingsRepository extends JpaRepository<HomepageSettings, UUID> {
}
