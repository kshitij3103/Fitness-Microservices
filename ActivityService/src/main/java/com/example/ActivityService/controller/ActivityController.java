package com.example.ActivityService.controller;

import com.example.ActivityService.dto.ActivityRequest;
import com.example.ActivityService.dto.ActivityResponse;
import com.example.ActivityService.service.ActivityService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@AllArgsConstructor
public class ActivityController {
    private ActivityService activityService;

    @PostMapping
    public ResponseEntity<ActivityResponse> trackActivity(@RequestBody ActivityRequest activityRequest) {

        return ResponseEntity.ok(activityService.trackActivity(activityRequest));
    }
    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getUserActivities(@RequestHeader("X-User-ID")  String userId) {

        return ResponseEntity.ok(activityService.getUserActivity(userId));
    }
    @GetMapping("/{activityId}")
    public ResponseEntity<ActivityResponse> getActivity(@PathVariable  String activityId) {

        return ResponseEntity.ok(activityService.getActivityById(activityId));
    }



}
