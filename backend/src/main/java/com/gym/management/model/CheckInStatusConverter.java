package com.gym.management.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CheckInStatusConverter implements AttributeConverter<CheckInStatus, String> {

    @Override
    public String convertToDatabaseColumn(CheckInStatus status) {
        if (status == null) return null;
        return status.name();
    }

    @Override
    public CheckInStatus convertToEntityAttribute(String dbValue) {
        return CheckInStatus.fromString(dbValue);
    }
}