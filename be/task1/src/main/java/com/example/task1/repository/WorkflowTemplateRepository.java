package com.example.task1.repository;

import com.example.task1.entity.WorkflowTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowTemplateRepository extends JpaRepository<WorkflowTemplate,Long> {
    boolean existsByName(String name);
    List<WorkflowTemplate> findByActiveTrue();
}
