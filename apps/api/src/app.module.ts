import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { ExampleController } from './example/example.controller';
import { FailedTransactionController } from './controllers/failed-transaction.controller';
import { CrossChainGasController } from './controllers/cross-chain-gas.controller';
import { FailedTransactionService } from './services/failed-transaction.service';
import { MitigationService } from './services/mitigation.service';
import { TransactionAnalysisService } from './services/transaction-analysis.service';
import { CrossChainGasService } from './services/cross-chain-gas.service';
import { RateLimitingModule, RateLimitGuard } from './rate-limiting';

@Module({
    imports: [
        // Legacy throttler as backup (disabled by default, can be enabled via env)
        ThrottlerModule.forRoot([
            {
                name: 'default',
                ttl: 60000,  // 60 seconds in milliseconds
                limit: 100,  // 100 requests per TTL window (generous fallback)
            },
        ]),
        // New Redis-based rate limiting module
        RateLimitingModule.forRoot(),
    ],
    controllers: [
        AppController,
        ExampleController,
        FailedTransactionController,
        CrossChainGasController,
        // Add your controllers here - remember to add @Version('1') decorator
    ],
    providers: [
        // Apply RateLimitGuard globally for per-API key rate limiting
        {
            provide: APP_GUARD,
            useClass: RateLimitGuard,
        },
        FailedTransactionService,
        MitigationService,
        TransactionAnalysisService,
        CrossChainGasService,
    ],
})
export class AppModule { }
