import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);

export async function POST(req: NextRequest) {
  try {
    const { domain, target } = await req.json();

    if (!domain || !target) {
      return NextResponse.json({ error: 'Domain and target are required' }, { status: 400 });
    }

    try {
      const records = await resolveCname(domain);
      const isValid = records.some(record => record.toLowerCase() === target.toLowerCase());

      return NextResponse.json({ 
        isValid, 
        found: records[0] || null,
        message: isValid ? 'DNS record verified successfully!' : `Domain points to ${records[0] || 'nothing'} instead of ${target}`
      });
    } catch (dnsErr: any) {
      return NextResponse.json({ 
        isValid: false, 
        error: dnsErr.code === 'ENODATA' || dnsErr.code === 'ENOTFOUND' ? 'No CNAME record found' : dnsErr.message 
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
