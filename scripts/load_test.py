#!/usr/bin/env python3
"""
Performance Load Test Script for Gym Management System
Simulates 24 concurrent users across 3 portals (Owner, Trainer, Member)

Usage:
    python load_test.py [--users 24] [--duration 60] [--base-url http://localhost:8081]
"""

import asyncio
import aiohttp
import time
import random
import argparse
import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime
import statistics

@dataclass
class RequestResult:
    endpoint: str
    method: str
    status: int
    response_time: float  # in milliseconds
    success: bool
    error: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class UserSession:
    user_id: int
    role: str  # OWNER, TRAINER, MEMBER
    token: Optional[str] = None
    results: List[RequestResult] = field(default_factory=list)

class LoadTester:
    """Load testing engine for the Gym Management System"""
    
    # API endpoints grouped by role and frequency
    ENDPOINTS = {
        'OWNER': [
            ('GET', '/api/analytics/dashboard', 5),
            ('GET', '/api/members', 3),
            ('GET', '/api/trainers', 3),
            ('GET', '/api/pt-sessions', 2),
            ('GET', '/api/transactions', 2),
            ('GET', '/api/classes', 1),
            ('GET', '/api/equipment', 1),
        ],
        'TRAINER': [
            ('GET', '/api/trainer/dashboard', 5),
            ('GET', '/api/trainer/my-members', 4),
            ('GET', '/api/trainer/schedule', 3),
            ('GET', '/api/pt-sessions', 3),
            ('GET', '/api/trainer/stats', 2),
        ],
        'MEMBER': [
            ('GET', '/api/member/dashboard', 5),
            ('GET', '/api/member/profile', 3),
            ('GET', '/api/member/sessions', 3),
            ('GET', '/api/member/attendance', 2),
            ('GET', '/api/classes', 2),
        ],
        'COMMON': [
            ('GET', '/api/auth/me', 5),
            ('GET', '/api/notifications', 2),
        ]
    }
    
    def __init__(self, base_url: str, num_users: int = 24, duration: int = 60):
        self.base_url = base_url.rstrip('/')
        self.num_users = num_users
        self.duration = duration
        self.sessions: List[UserSession] = []
        self.all_results: List[RequestResult] = []
        self.start_time: float = 0.0
        
    async def setup_sessions(self):
        """Create user sessions for testing"""
        # Distribute users: 8 owners, 8 trainers, 8 members (for 24 users)
        roles = ['OWNER'] * (self.num_users // 3) + \
                ['TRAINER'] * (self.num_users // 3) + \
                ['MEMBER'] * (self.num_users - 2 * (self.num_users // 3))
        
        for i, role in enumerate(roles):
            self.sessions.append(UserSession(user_id=i+1, role=role))
        
        print(f"Created {len(self.sessions)} user sessions")
        print(f"  - Owners: {sum(1 for s in self.sessions if s.role == 'OWNER')}")
        print(f"  - Trainers: {sum(1 for s in self.sessions if s.role == 'TRAINER')}")
        print(f"  - Members: {sum(1 for s in self.sessions if s.role == 'MEMBER')}")
    
    async def make_request(
        self, 
        session: aiohttp.ClientSession, 
        user: UserSession,
        method: str, 
        endpoint: str
    ) -> RequestResult:
        """Make a single API request and record the result"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if user.token:
            headers['Authorization'] = f'Bearer {user.token}'
        
        start_time = time.time()
        
        try:
            async with session.request(method, url, headers=headers, timeout=30) as response:
                response_time = (time.time() - start_time) * 1000  # Convert to ms
                
                result = RequestResult(
                    endpoint=endpoint,
                    method=method,
                    status=response.status,
                    response_time=response_time,
                    success=200 <= response.status < 300
                )
                
                return result
                
        except asyncio.TimeoutError:
            return RequestResult(
                endpoint=endpoint,
                method=method,
                status=0,
                response_time=(time.time() - start_time) * 1000,
                success=False,
                error="Timeout"
            )
        except Exception as e:
            return RequestResult(
                endpoint=endpoint,
                method=method,
                status=0,
                response_time=(time.time() - start_time) * 1000,
                success=False,
                error=str(e)
            )
    
    def select_endpoint(self, role: str) -> tuple:
        """Select a random endpoint weighted by frequency"""
        endpoints = self.ENDPOINTS[role] + self.ENDPOINTS['COMMON']
        weights = [e[2] for e in endpoints]
        selected = random.choices(endpoints, weights=weights, k=1)[0]
        return selected[0], selected[1]
    
    async def simulate_user(self, user: UserSession, http_session: aiohttp.ClientSession):
        """Simulate a single user making requests over the test duration"""
        end_time = self.start_time + self.duration
        
        while time.time() < end_time:
            method, endpoint = self.select_endpoint(user.role)
            result = await self.make_request(http_session, user, method, endpoint)
            user.results.append(result)
            self.all_results.append(result)
            
            # Random delay between requests (0.5 - 3 seconds) to simulate real user behavior
            await asyncio.sleep(random.uniform(0.5, 3.0))
    
    async def run_test(self):
        """Run the load test"""
        print(f"\n{'='*60}")
        print("Starting Load Test")
        print(f"{'='*60}")
        print(f"Base URL: {self.base_url}")
        print(f"Users: {self.num_users}")
        print(f"Duration: {self.duration} seconds")
        print(f"{'='*60}\n")
        
        await self.setup_sessions()
        
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=50)
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as http_session:
            self.start_time = time.time()
            
            # Create tasks for all users
            tasks = [
                self.simulate_user(user, http_session)
                for user in self.sessions
            ]
            
            # Progress indicator
            progress_task = asyncio.create_task(self.show_progress())
            
            # Run all user simulations concurrently
            await asyncio.gather(*tasks)
            
            progress_task.cancel()
            
        self.generate_report()
    
    async def show_progress(self):
        """Show progress during the test"""
        try:
            while True:
                elapsed = time.time() - self.start_time
                remaining = max(0, self.duration - elapsed)
                total_requests = len(self.all_results)
                
                print(f"\rProgress: {elapsed:.0f}/{self.duration}s | "
                      f"Requests: {total_requests} | "
                      f"Remaining: {remaining:.0f}s", end='', flush=True)
                
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            print()  # New line after progress
    
    def generate_report(self):
        """Generate and print the performance report"""
        if not self.all_results:
            print("No results to report")
            return
        
        print(f"\n{'='*60}")
        print("PERFORMANCE REPORT")
        print(f"{'='*60}\n")
        
        # Overall metrics
        total_requests = len(self.all_results)
        successful = sum(1 for r in self.all_results if r.success)
        failed = total_requests - successful
        
        response_times = [r.response_time for r in self.all_results]
        avg_response = statistics.mean(response_times)
        median_response = statistics.median(response_times)
        p95_response = sorted(response_times)[int(len(response_times) * 0.95)] if response_times else 0
        p99_response = sorted(response_times)[int(len(response_times) * 0.99)] if response_times else 0
        min_response = min(response_times)
        max_response = max(response_times)
        
        throughput = total_requests / self.duration
        
        print("SUMMARY")
        print("-" * 40)
        print(f"Total Requests:      {total_requests}")
        print(f"Successful:          {successful} ({successful/total_requests*100:.1f}%)")
        print(f"Failed:              {failed} ({failed/total_requests*100:.1f}%)")
        print(f"Throughput:          {throughput:.2f} req/sec")
        print()
        
        print("RESPONSE TIMES (ms)")
        print("-" * 40)
        print(f"Average:             {avg_response:.2f}")
        print(f"Median:              {median_response:.2f}")
        print(f"95th Percentile:     {p95_response:.2f}")
        print(f"99th Percentile:     {p99_response:.2f}")
        print(f"Min:                 {min_response:.2f}")
        print(f"Max:                 {max_response:.2f}")
        print()
        
        # Per-endpoint breakdown
        print("PER-ENDPOINT BREAKDOWN")
        print("-" * 40)
        
        endpoint_stats: Dict[str, List[float]] = {}
        for r in self.all_results:
            if r.endpoint not in endpoint_stats:
                endpoint_stats[r.endpoint] = []
            endpoint_stats[r.endpoint].append(r.response_time)
        
        print(f"{'Endpoint':<35} {'Count':>8} {'Avg(ms)':>10} {'P95(ms)':>10}")
        print("-" * 65)
        
        for endpoint, times in sorted(endpoint_stats.items()):
            count = len(times)
            avg = statistics.mean(times)
            p95 = sorted(times)[int(len(times) * 0.95)] if len(times) > 1 else times[0]
            print(f"{endpoint:<35} {count:>8} {avg:>10.2f} {p95:>10.2f}")
        
        print()
        
        # Per-role breakdown
        print("PER-ROLE BREAKDOWN")
        print("-" * 40)
        
        for role in ['OWNER', 'TRAINER', 'MEMBER']:
            role_results = [r for s in self.sessions for r in s.results if s.role == role]
            if role_results:
                role_times = [r.response_time for r in role_results]
                role_success = sum(1 for r in role_results if r.success)
                print(f"{role}:")
                print(f"  Requests: {len(role_results)}")
                print(f"  Success Rate: {role_success/len(role_results)*100:.1f}%")
                print(f"  Avg Response: {statistics.mean(role_times):.2f}ms")
        
        print()
        
        # Performance assessment
        print("PERFORMANCE ASSESSMENT")
        print("-" * 40)
        
        issues = []
        if avg_response > 200:
            issues.append(f"⚠️  Average response time ({avg_response:.0f}ms) exceeds 200ms target")
        if p95_response > 500:
            issues.append(f"⚠️  P95 response time ({p95_response:.0f}ms) exceeds 500ms threshold")
        if failed / total_requests > 0.01:
            issues.append(f"⚠️  Error rate ({failed/total_requests*100:.1f}%) exceeds 1% threshold")
        
        if issues:
            for issue in issues:
                print(issue)
        else:
            print("✅ All performance metrics within acceptable limits")
        
        print()
        
        # Save detailed results to JSON
        report_data = {
            'summary': {
                'total_requests': total_requests,
                'successful': successful,
                'failed': failed,
                'throughput': throughput,
                'duration': self.duration,
                'num_users': self.num_users,
            },
            'response_times': {
                'average': avg_response,
                'median': median_response,
                'p95': p95_response,
                'p99': p99_response,
                'min': min_response,
                'max': max_response,
            },
            'endpoints': {
                endpoint: {
                    'count': len(times),
                    'average': statistics.mean(times),
                    'p95': sorted(times)[int(len(times) * 0.95)] if len(times) > 1 else times[0]
                }
                for endpoint, times in endpoint_stats.items()
            }
        }
        
        with open('load_test_results.json', 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"Detailed results saved to: load_test_results.json")
        print(f"{'='*60}")


def main():
    parser = argparse.ArgumentParser(description='Load test the Gym Management System')
    parser.add_argument('--users', type=int, default=24, help='Number of concurrent users')
    parser.add_argument('--duration', type=int, default=60, help='Test duration in seconds')
    parser.add_argument('--base-url', type=str, default='http://localhost:8081', 
                        help='Base URL of the API')
    
    args = parser.parse_args()
    
    tester = LoadTester(
        base_url=args.base_url,
        num_users=args.users,
        duration=args.duration
    )
    
    asyncio.run(tester.run_test())


if __name__ == '__main__':
    main()
