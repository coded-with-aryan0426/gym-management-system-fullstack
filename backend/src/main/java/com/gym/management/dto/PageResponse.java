package com.gym.management.dto;

import java.util.List;

/**
 * Generic paginated response DTO for API endpoints.
 * 
 * @param <T> Type of content items
 */
public class PageResponse<T> {
    private List<T> content;
    private int currentPage;
    private int pageSize;
    private long totalCount;
    private int totalPages;
    private String sortType; // 'alphabetical' | 'newest'

    public PageResponse() {
    }

    public PageResponse(List<T> content, int currentPage, int pageSize, long totalCount, String sortType) {
        this.content = content;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalCount = totalCount;
        this.totalPages = (int) Math.ceil((double) totalCount / pageSize);
        this.sortType = sortType;
    }

    // Getters and Setters
    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public String getSortType() {
        return sortType;
    }

    public void setSortType(String sortType) {
        this.sortType = sortType;
    }
}
