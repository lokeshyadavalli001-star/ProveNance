import React, { useState, useEffect } from 'react';
import {
  Lock,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  Fingerprint,
  RefreshCw,
  Hash,
  ArrowRight,
  Eye,
  KeyRound
} from 'lucide-react';
import { TiltCard } from '../common/TiltCard.js';

interface AuditBlock {
  blockNumber: number;
  timestamp: string;
  eventType: string;
  userId: string;
  payloadDigest: string;
  previousHash: string;
  currentHash: string;
  status: 'VERIFIED' | 'TAMPERED';
}

const INITIAL_CHAIN: AuditBlock[] = [
  {
    blockNumber: 101,
    timestamp: '2026-10-03 14:10:02',
    eventType: 'GENESIS_ANCHOR',
    userId: 'system_root',
    payloadDigest: 'sha256:8f4c2e...b3a1',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    currentHash: '7a8f9c2d1e0b3a4c5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a',
    status: 'VERIFIED'
  },
  {
    blockNumber: 102,
    timestamp: '2026-10-03 14:15:33',
    eventType: 'GOVERNED_QUERY_EXECUTION',
    userId: 'usr_analyst_emea',
    payloadDigest: 'sha256:d4e1a9...99fc',
    previousHash: '7a8f9c2d1e0b3a4c5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a',
    currentHash: '3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b',
    status: 'VERIFIED'
  },
  {
    blockNumber: 103,
    timestamp: '2026-10-03 14:22:18',
    eventType: 'HMAC_MITIGATION_SIGN',
    userId: 'usr_admin',
    payloadDigest: 'sha256:22bb91...7710',
    previousHash: '3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b',
    currentHash: '9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
    status: 'VERIFIED'
  },
  {
    blockNumber: 104,
    timestamp: '2026-10-03 14:30:45',
    eventType: 'POLICY_GUARD_INSPECTION',
    userId: 'policy_kernel',
    payloadDigest: 'sha256:55aa12...e304',
    previousHash: '9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
    currentHash: '1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9e0d1c2b3a4f5e6d7c8b9a0f1e2d',
    status: 'VERIFIED'
  }
];

export const CryptoVault3D: React.FC = () => {
  const [blocks, setBlocks] = useState<AuditBlock[]>(INITIAL_CHAIN);
  const [selectedBlock, setSelectedBlock] = useState<AuditBlock>(INITIAL_CHAIN[2]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeScanBlock, setActiveScanBlock] = useState<number | null>(null);
  const [tampered, setTampered] = useState(false);

  // Verification Animation Sequencer
  const triggerVerify = () => {
    setIsVerifying(true);
    setActiveScanBlock(101);

    const stepInterval = 400;
    blocks.forEach((b, index) => {
      setTimeout(() => {
        setActiveScanBlock(b.blockNumber);
      }, index * stepInterval);
    });

    setTimeout(() => {
      setActiveScanBlock(null);
      setIsVerifying(false);
    }, blocks.length * stepInterval + 200);
  };

  const toggleTamperSimulation = () => {
    if (tampered) {
      // Restore valid chain
      setBlocks(INITIAL_CHAIN);
      setTampered(false);
      setSelectedBlock(INITIAL_CHAIN[2]);
    } else {
      // Simulate unauthorized database modification on block 102
      const modified = [...INITIAL_CHAIN];
      modified[1] = {
        ...modified[1],
        payloadDigest: 'sha256:MALICIOUS_TAMPERED_RECORD',
        status: 'TAMPERED'
      };
      // Chain break on 103 & 104 because previousHash no longer matches
      modified[2] = { ...modified[2], status: 'TAMPERED' };
      modified[3] = { ...modified[3], status: 'TAMPERED' };
      setBlocks(modified);
      setTampered(true);
      setSelectedBlock(modified[1]);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Holographic Grid */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <Fingerprint className="h-5 w-5 text-provenance-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              3D Holographic Cryptographic Chain
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                tampered
                  ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}
            >
              {tampered ? 'TAMPER BREACH DETECTED' : 'BLOCKS ANCHORED (SHA-256)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every query, policy gate & approval is cryptographically chained to its predecessor.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTamperSimulation}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              tampered
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'bg-red-950/40 border-red-800/60 text-red-300 hover:bg-red-900/60'
            }`}
          >
            {tampered ? '↺ Restore Cryptographic Chain' : '⚠️ Test Tamper Detection'}
          </button>

          <button
            onClick={triggerVerify}
            disabled={isVerifying}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-provenance-600 hover:bg-provenance-500 text-white shadow-md shadow-provenance-600/30 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Scanning Chain...' : 'Verify Cryptographic Proofs'}</span>
          </button>
        </div>
      </div>

      {/* 3D Chained Blocks Carousel */}
      <div className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {blocks.map((block) => {
            const isSelected = selectedBlock.blockNumber === block.blockNumber;
            const isScanning = activeScanBlock === block.blockNumber;
            const isFailed = block.status === 'TAMPERED';

            return (
              <TiltCard
                key={block.blockNumber}
                maxTilt={14}
                scale={1.03}
                onClick={() => setSelectedBlock(block)}
                className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                  isFailed
                    ? 'border-red-600 bg-red-950/40 shadow-lg shadow-red-600/20'
                    : isSelected
                    ? 'border-provenance-500 bg-slate-900/90 shadow-lg shadow-provenance-500/20'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                {/* Laser Scanning Line Animation when verifying */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-laser shadow-sm shadow-emerald-400" />
                )}

                {/* Block Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-white flex items-center space-x-1">
                    <Hash className="h-3.5 w-3.5 text-provenance-400" />
                    <span>Block #{block.blockNumber}</span>
                  </span>

                  {isFailed ? (
                    <AlertOctagon className="h-4 w-4 text-red-400 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="text-slate-300 font-semibold truncate">{block.eventType}</div>
                  <div className="text-slate-500 text-[10px]">{block.timestamp}</div>
                  <div className="font-mono text-[10px] text-slate-400 bg-slate-950/80 p-1.5 rounded border border-slate-800/80 truncate">
                    <span className="text-slate-500">Hash: </span>
                    <span className={isFailed ? 'text-red-400' : 'text-emerald-400'}>
                      {block.currentHash.slice(0, 16)}...
                    </span>
                  </div>
                </div>

                {/* Connecting Arrow for Chain Continuity */}
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Prev: {block.previousHash.slice(0, 8)}...</span>
                  <span
                    className={`font-semibold ${
                      isFailed ? 'text-red-400' : 'text-provenance-400'
                    }`}
                  >
                    {isFailed ? 'BROKEN' : 'LINKED'}
                  </span>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* Selected Block Cryptographic Deep-Dive Drawer */}
      <div className="relative z-10 rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-provenance-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Cryptographic Block #{selectedBlock.blockNumber} Proof Details
            </span>
          </div>

          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
              selectedBlock.status === 'TAMPERED'
                ? 'bg-red-950 text-red-400 border border-red-800'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}
          >
            {selectedBlock.status === 'TAMPERED' ? 'INVALID SIGNATURE CHECKSUM' : 'SHA-256 VALIDATED'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">
              Previous Hash ($H_{'{i-1}'}$)
            </span>
            <p className="text-slate-300 break-all text-[11px]">{selectedBlock.previousHash}</p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">
              Current Block Hash ($H_i$)
            </span>
            <p
              className={`break-all text-[11px] font-bold ${
                selectedBlock.status === 'TAMPERED' ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {selectedBlock.currentHash}
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400">
            <strong>Payload Digest:</strong> {selectedBlock.payloadDigest}
          </span>
          <span className="text-slate-400">
            <strong>Actor:</strong> {selectedBlock.userId}
          </span>
          <span className="text-emerald-400 font-mono text-[11px]">
            HMAC-SHA256: Verified by Defense Gateway
          </span>
        </div>
      </div>
    </div>
  );
};
