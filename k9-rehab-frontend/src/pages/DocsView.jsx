import React, { useState, useRef, useEffect } from "react";
import { FiChevronRight, FiBook, FiArrowLeft } from "react-icons/fi";

/* ── Sidebar nav data ── */
const SECTIONS = [
  {
    title: "Preface",
    items: [
      { id: "about-vsi", label: "About VSI" },
      { id: "intended-audience", label: "Intended Audience" },
      { id: "document-structure", label: "Document Structure" },
      { id: "related-documents", label: "Related Documents" },
      { id: "comments", label: "VSI Encourages Your Comments" },
      { id: "documentation", label: "OpenVMS Documentation" },
      { id: "conventions", label: "Typographical Conventions" },
    ],
  },
  {
    title: "Chapter 1. Introduction",
    items: [
      { id: "applicability", label: "1.1 Applicability" },
      { id: "architectural-level", label: "1.2 Architectural Level" },
      { id: "goals", label: "1.3 Goals" },
      { id: "definitions", label: "1.4 Definitions" },
    ],
  },
  {
    title: "Chapter 2. OpenVMS VAX Conventions",
    items: [
      { id: "vax-register", label: "2.1 Register Usage" },
      { id: "vax-scalar", label: "2.1.1 Scalar Processor" },
      { id: "vax-vector", label: "2.1.2 Vector Processor" },
      { id: "vax-stack", label: "2.2 Stack Usage" },
      { id: "vax-calling", label: "2.3 Calling Sequence" },
      { id: "vax-arglist", label: "2.4 Argument List" },
      { id: "vax-returns", label: "2.5 Function Value Returns" },
      { id: "vax-sync", label: "2.6 Vector/Scalar Synchronization" },
    ],
  },
  {
    title: "Chapter 3. OpenVMS Alpha Conventions",
    items: [
      { id: "alpha-register", label: "3.1 Register Usage" },
      { id: "alpha-address", label: "3.2 Address Representation" },
      { id: "alpha-procedure", label: "3.3 Procedure Representation" },
      { id: "alpha-types", label: "3.4 Procedure Types" },
      { id: "alpha-stack", label: "3.5 Procedure Call Stack" },
      { id: "alpha-transfer", label: "3.6 Transfer of Control" },
      { id: "alpha-data", label: "3.7 Data Passing" },
      { id: "alpha-alloc", label: "3.8 Data Allocation" },
      { id: "alpha-multithread", label: "3.9 Multithreaded Environments" },
    ],
  },
  {
    title: "Chapter 4. OpenVMS I64 Conventions",
    items: [
      { id: "i64-register", label: "4.1 Register Usage" },
      { id: "i64-address", label: "4.2 Address Representation" },
      { id: "i64-procedure", label: "4.3 Procedure Representation" },
      { id: "i64-types", label: "4.4 Procedure Types" },
      { id: "i64-memstack", label: "4.5 Memory Stack" },
      { id: "i64-regstack", label: "4.6 Register Stack" },
      { id: "i64-linkage", label: "4.7 Procedure Linkage" },
      { id: "i64-callstack", label: "4.8 Procedure Call Stack" },
      { id: "i64-alloc", label: "4.9 Data Allocation" },
    ],
  },
  {
    title: "Chapter 5. OpenVMS x86-64 Conventions",
    items: [
      { id: "x86-register", label: "5.1 Register Usage" },
      { id: "x86-address", label: "5.2 Address & Pointer Representation" },
      { id: "x86-values", label: "5.3 Procedure Values" },
      { id: "x86-types", label: "5.4 Procedure Types" },
      { id: "x86-overflow", label: "5.5 Stack Overflow Detection" },
      { id: "x86-call", label: "5.6 Procedure Call and Return" },
      { id: "x86-params", label: "5.7 Parameter & Return Value Passing" },
      { id: "x86-callstack", label: "5.8 Procedure Call Stack" },
      { id: "x86-data", label: "5.9 Data Alignment and Layout" },
      { id: "x86-addressing", label: "5.10 Addressing" },
    ],
  },
  {
    title: "Chapter 6. Signature Information",
    items: [
      { id: "sig-overview", label: "6.1 Overview" },
      { id: "sig-blocks", label: "6.2 Signature Information Blocks" },
    ],
  },
  {
    title: "Chapter 7. Argument Data Types",
    items: [
      { id: "atomic-types", label: "7.1 Atomic Data Types" },
      { id: "string-types", label: "7.2 String Data Types" },
      { id: "misc-types", label: "7.3 Miscellaneous Data Types" },
      { id: "reserved-types", label: "7.4 Reserved Data-Type Codes" },
      { id: "varying-string", label: "7.5 Varying Character String" },
    ],
  },
  {
    title: "Chapter 8. Argument Descriptors",
    items: [
      { id: "desc-proto", label: "8.1 Descriptor Prototype" },
      { id: "desc-fixed", label: "8.2 Fixed-Length Descriptor" },
      { id: "desc-dynamic", label: "8.3 Dynamic String Descriptor" },
      { id: "desc-array", label: "8.4 Array Descriptor" },
      { id: "desc-unaligned", label: "8.5 Unaligned Bit String Descriptor" },
    ],
  },
  {
    title: "Chapter 9. OpenVMS Conditions",
    items: [
      { id: "cond-values", label: "9.1 Condition Values" },
      { id: "cond-handlers", label: "9.2 Condition Handlers" },
      { id: "cond-options", label: "9.3 Handler Options" },
      { id: "cond-operations", label: "9.4 Operations with Handlers" },
      { id: "cond-properties", label: "9.5 Properties of Handlers" },
      { id: "cond-return", label: "9.6 Returning from Handler" },
      { id: "cond-unwind", label: "9.7 Unwind from Signal" },
      { id: "cond-goto", label: "9.8 GOTO Unwind Operations" },
      { id: "cond-multiple", label: "9.9 Multiple Active Signals" },
    ],
  },
  {
    title: "Appendix A. Stack Unwinding (I64)",
    items: [
      { id: "app-a1", label: "A.1 Overview" },
      { id: "app-a2", label: "A.2 Exception Handling" },
    ],
  },
  {
    title: "Appendix B. Stack Unwinding (x86-64)",
    items: [
      { id: "app-b1", label: "B.1 Overview" },
      { id: "app-b2", label: "B.2 Exception Handling" },
    ],
  },
  {
    title: "Appendix C. Industry Differences",
    items: [{ id: "app-c1", label: "C.1 Summary of Differences" }],
  },
];

/* ── Reusable sub-components ── */

function Note({ children }) {
  return (
    <div className="bg-blue-50 border border-blue-200 border-l-4 border-l-blue-500 rounded p-3 mb-4 text-sm">
      <span className="font-bold text-blue-600 block mb-1">Note</span>
      {children}
    </div>
  );
}

function Warning({ children }) {
  return (
    <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-orange-500 rounded p-3 mb-4 text-sm">
      <span className="font-bold text-orange-600 block mb-1">Important</span>
      {children}
    </div>
  );
}

function Code({ children }) {
  return (
    <code className="font-mono text-[13px] bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded">
      {children}
    </code>
  );
}

function Pre({ children }) {
  return (
    <pre className="bg-slate-50 border border-slate-200 rounded p-4 overflow-x-auto mb-4 leading-relaxed">
      <code className="font-mono text-[13px] text-slate-800">{children}</code>
    </pre>
  );
}

function DocTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto mb-5">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="bg-slate-50 border border-slate-300 px-3 py-2 text-left font-semibold text-slate-800"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? "bg-slate-50/50" : ""}>
              {row.map((cell, ci) => (
                <td key={ci} className="border border-slate-300 px-3 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Collapsible sidebar section ── */
function NavSection({ section, activeId, onSelect, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 w-full px-5 py-1.5 text-left font-semibold text-slate-800 hover:bg-slate-200/60 text-[13.5px]"
      >
        <FiChevronRight
          className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`}
        />
        {section.title}
      </button>
      {open && (
        <div className="pl-4">
          {section.items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`block w-full text-left px-5 py-1 text-[13px] leading-snug transition-colors ${
                activeId === item.id
                  ? "text-blue-600 font-semibold bg-blue-50 border-r-[3px] border-blue-600"
                  : "text-slate-500 hover:text-blue-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main DocsView ── */
export default function DocsView({ setView }) {
  const [activeId, setActiveId] = useState("intended-audience");
  const contentRef = useRef(null);

  function scrollTo(id) {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* ── Doc sidebar ── */}
      <aside className="w-[300px] min-w-[300px] bg-slate-50 border-r border-slate-200 overflow-y-auto">
        <div className="px-5 py-3 border-b border-slate-200">
          <button
            onClick={() => setView("dashboard")}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mb-2"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#1a3a5c] flex items-center justify-center">
              <FiBook className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-[#1a3a5c]">
              VSI OpenVMS Calling Standard
            </span>
          </div>
        </div>
        <div className="py-2">
          {SECTIONS.map((s, i) => (
            <NavSection
              key={i}
              section={s}
              activeId={activeId}
              onSelect={scrollTo}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </aside>

      {/* ── Doc content ── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] px-10 py-8 pb-20">
          {/* Breadcrumb */}
          <div className="text-[13px] text-slate-400 mb-5">
            <button onClick={() => setView("dashboard")} className="text-blue-600 hover:underline">
              Home
            </button>{" "}
            &gt;{" "}
            <span className="text-slate-500">Documentation</span> &gt;{" "}
            <span className="text-slate-500">VSI OpenVMS Calling Standard</span>
          </div>

          <h1 className="text-[26px] font-bold text-[#1a3a5c] mb-2 pb-3 border-b-2 border-slate-200">
            VSI OpenVMS Calling Standard
          </h1>
          <div className="text-[13px] text-slate-400 mb-6 flex gap-4">
            <span>Document Version: 4.0</span>
            <span>Operating System: VSI OpenVMS</span>
            <span>Last Updated: June 2024</span>
          </div>

          {/* ── Preface ── */}
          <h2 id="preface" className="text-[20px] font-semibold text-slate-800 mt-8 mb-3 pb-2 border-b border-slate-200">
            Preface
          </h2>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            This document defines the requirements and conventions that govern the interaction
            between procedures executing on the OpenVMS operating system across VAX, Alpha, I64,
            and x86-64 architectures.
          </p>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            This standard establishes the calling mechanisms, argument passing conventions,
            register usage rules, and condition handling procedures that enable multilanguage
            interoperability across all supported OpenVMS platforms.
          </p>
          <Note>
            This document is under engineering change order (ECO) control. Changes to this
            standard must be approved through the formal ECO process.
          </Note>

          <h3 id="about-vsi" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            About VSI
          </h3>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            VMS Software, Inc. (VSI) is the company that develops and supports the OpenVMS
            operating system. VSI continues to evolve OpenVMS to support modern hardware
            architectures while maintaining backward compatibility with existing applications.
          </p>

          <h3 id="intended-audience" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            Intended Audience
          </h3>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            This document is primarily intended for <strong>developers of compilers and
            debuggers</strong> who need to understand the calling conventions used on OpenVMS
            systems. It is also relevant to systems programmers who write code at the
            procedure-call interface level.
          </p>

          <h3 id="document-structure" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            Document Structure
          </h3>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            This document is organized as follows:
          </p>
          <ul className="list-disc pl-7 mb-4 text-[15px] text-slate-700 space-y-1">
            <li><strong>Chapter 1</strong> provides an introduction and key definitions</li>
            <li><strong>Chapters 2&ndash;5</strong> describe architecture-specific calling conventions</li>
            <li><strong>Chapter 6</strong> covers signature information for translated images</li>
            <li><strong>Chapters 7&ndash;8</strong> define argument data types and descriptors</li>
            <li><strong>Chapter 9</strong> describes the condition handling mechanism</li>
            <li><strong>Appendices A&ndash;C</strong> provide supplementary information</li>
          </ul>

          <h3 id="conventions" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            Typographical Conventions
          </h3>
          <DocTable
            headers={["Convention", "Meaning"]}
            rows={[
              [<Code>monospace</Code>, "System commands, routine names, file names, and code examples"],
              [<strong>Bold text</strong>, "Defined terms, argument names, and emphasis"],
              [<em>Italic text</em>, "Variable names, manual titles, and important information"],
              [<Code>Ctrl/x</Code>, "Hold down the Ctrl key while pressing the indicated key"],
              [<Code>{"[ ]"}</Code>, "Optional elements in syntax descriptions"],
              [<Code>{`{ }`}</Code>, "Required choice among alternatives"],
              [<Code>...</Code>, "Preceding item(s) can be repeated"],
            ]}
          />

          <hr className="my-7 border-slate-200" />

          {/* ── Chapter 1 ── */}
          <h2 id="ch1" className="text-[20px] font-semibold text-slate-800 mt-8 mb-3 pb-2 border-b border-slate-200">
            <span className="text-slate-400 font-normal mr-1">Chapter 1.</span> Introduction
          </h2>

          <h3 id="applicability" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            <span className="text-slate-400 font-normal mr-1">1.1</span> Applicability
          </h3>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            The interfaces, methods, and conventions specified in this manual are primarily
            intended for use by implementers of compilers, debuggers, and other run-time tools
            for the OpenVMS operating system.
          </p>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            The conventions described here apply across all supported OpenVMS architectures:
            VAX, Alpha, I64 (Itanium), and x86-64. Architecture-specific details are provided
            in the relevant chapters.
          </p>

          <h3 id="goals" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            <span className="text-slate-400 font-normal mr-1">1.3</span> Goals
          </h3>
          <ul className="list-disc pl-7 mb-4 text-[15px] text-slate-700 space-y-1">
            <li>Enable interoperability between routines written in different programming languages</li>
            <li>Support efficient procedure calls while maintaining adequate debugging support</li>
            <li>Provide a consistent framework across different hardware architectures</li>
            <li>Define clear conventions for argument passing, register usage, and stack management</li>
            <li>Establish condition handling mechanisms for error recovery</li>
          </ul>

          <h3 id="definitions" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            <span className="text-slate-400 font-normal mr-1">1.4</span> Definitions
          </h3>
          <dl className="mb-4 text-[15px] text-slate-700">
            {[
              ["Procedure", "A body of code that can be invoked via a call instruction and returns control to the caller upon completion. A procedure may accept arguments and return a function value."],
              ["Procedure Value", "A value that uniquely identifies a procedure and can be used to call that procedure. On 64-bit systems, addresses are 64-bit values."],
              ["Bound Procedure", "A procedure value that includes both the code address and an environment pointer, allowing the procedure to access its enclosing lexical scope."],
              ["Call Frame", "The region of the stack allocated for a single procedure activation. Contains saved registers, local variables, and temporary storage."],
              ["Condition Handler", "A procedure that is invoked when an exception or signal occurs during execution. The handler may correct the error, unwind the stack, or resignal."],
              ["Stack Unwinding", "The process of successively removing call frames from the procedure call stack, invoking cleanup handlers as each frame is removed."],
            ].map(([term, def]) => (
              <React.Fragment key={term}>
                <dt className="font-semibold text-slate-800 mt-3">{term}</dt>
                <dd className="ml-5 mb-2 text-slate-600">{def}</dd>
              </React.Fragment>
            ))}
          </dl>

          <hr className="my-7 border-slate-200" />

          {/* ── Chapter 2 ── */}
          <h2 id="ch2" className="text-[20px] font-semibold text-slate-800 mt-8 mb-3 pb-2 border-b border-slate-200">
            <span className="text-slate-400 font-normal mr-1">Chapter 2.</span> OpenVMS VAX Conventions
          </h2>

          <h3 id="vax-register" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            <span className="text-slate-400 font-normal mr-1">2.1</span> Register Usage
          </h3>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            The VAX architecture provides 16 general-purpose registers (R0&ndash;R15) and a
            Processor Status Longword (PSL). The calling standard partitions these registers
            into specific categories based on their usage across procedure calls.
          </p>

          <h4 id="vax-scalar" className="text-[15px] font-semibold text-slate-800 mt-5 mb-2">
            <span className="text-slate-400 font-normal mr-1">2.1.1</span> Scalar Processor Registers
          </h4>
          <DocTable
            headers={["Register", "Usage", "Preserved"]}
            rows={[
              [<Code>R0</Code>, "Function value return (low-order)", "No"],
              [<Code>R1</Code>, "Function value return (high-order)", "No"],
              [<Code>R2–R11</Code>, "General purpose, callee-saved per entry mask", "Per mask"],
              [<Code>R12 (AP)</Code>, "Argument Pointer", "Yes"],
              [<Code>R13 (FP)</Code>, "Frame Pointer", "Yes"],
              [<Code>R14 (SP)</Code>, "Stack Pointer", "Yes"],
              [<Code>R15 (PC)</Code>, "Program Counter", "N/A"],
            ]}
          />

          <h3 id="vax-stack" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            <span className="text-slate-400 font-normal mr-1">2.2</span> Stack Usage
          </h3>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            The VAX call stack grows from high addresses toward low addresses. The stack pointer
            (SP) always points to the top (lowest address) of the stack. The calling standard
            requires that SP be longword aligned (divisible by 4) at all times.
          </p>
          <Warning>
            Failure to maintain proper stack alignment may cause unpredictable behavior,
            including memory access violations and incorrect function return values.
          </Warning>

          <h3 id="vax-calling" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            <span className="text-slate-400 font-normal mr-1">2.3</span> Calling Sequence
          </h3>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            The VAX architecture provides the <Code>CALLG</Code> and <Code>CALLS</Code>{" "}
            instructions for procedure invocation:
          </p>
          <Pre>{`CALLS   #n, procedure    ; Call with arguments on stack
CALLG   arglist, procedure ; Call with argument list in memory`}</Pre>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            Both instructions create a call frame on the stack, save registers specified in
            the procedure's entry mask, and transfer control to the target procedure. The{" "}
            <Code>RET</Code> instruction returns control to the caller.
          </p>

          <hr className="my-7 border-slate-200" />

          {/* ── Chapter 5 ── */}
          <h2 id="ch5" className="text-[20px] font-semibold text-slate-800 mt-8 mb-3 pb-2 border-b border-slate-200">
            <span className="text-slate-400 font-normal mr-1">Chapter 5.</span> OpenVMS x86-64 Conventions
          </h2>

          <h3 id="x86-register" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            <span className="text-slate-400 font-normal mr-1">5.1</span> Register Usage
          </h3>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            The x86-64 architecture provides 16 general-purpose registers, 16 SSE registers,
            and various system registers.
          </p>
          <ul className="list-disc pl-7 mb-4 text-[15px] text-slate-700 space-y-1">
            <li><strong>Scratch registers</strong> — may be modified by the called procedure and are not preserved</li>
            <li><strong>Preserved registers</strong> — must be saved and restored by any procedure that modifies them</li>
            <li><strong>Special registers</strong> — have dedicated functions defined by the architecture</li>
          </ul>
          <DocTable
            headers={["Register", "Usage", "Class"]}
            rows={[
              [<Code>RAX</Code>, "Return value, scratch", "Scratch"],
              [<Code>RBX</Code>, "General purpose", "Preserved"],
              [<Code>RCX</Code>, "4th integer argument, scratch", "Scratch"],
              [<Code>RDX</Code>, "3rd integer argument, scratch", "Scratch"],
              [<Code>RSP</Code>, "Stack pointer", "Special"],
              [<Code>RBP</Code>, "Frame pointer (optional)", "Preserved"],
              [<Code>RSI</Code>, "2nd integer argument, scratch", "Scratch"],
              [<Code>RDI</Code>, "1st integer argument, scratch", "Scratch"],
              [<Code>R8–R11</Code>, "5th–8th arguments, scratch", "Scratch"],
              [<Code>R12–R15</Code>, "General purpose", "Preserved"],
            ]}
          />

          <h3 id="x86-call" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            <span className="text-slate-400 font-normal mr-1">5.6</span> Procedure Call and Return
          </h3>
          <Pre>{`; Example calling sequence
    sub     rsp, 32          ; Allocate shadow space
    mov     rcx, param1      ; 1st parameter in RCX
    mov     rdx, param2      ; 2nd parameter in RDX
    mov     r8,  param3      ; 3rd parameter in R8
    mov     r9,  param4      ; 4th parameter in R9
    call    target_procedure
    add     rsp, 32          ; Deallocate shadow space`}</Pre>
          <Note>
            The OpenVMS x86-64 calling convention requires 16-byte stack alignment at the
            point of the <Code>CALL</Code> instruction. The 32-byte shadow space must always
            be allocated by the caller, even for procedures with fewer than 4 parameters.
          </Note>

          <hr className="my-7 border-slate-200" />

          {/* ── Chapter 9 ── */}
          <h2 id="ch9" className="text-[20px] font-semibold text-slate-800 mt-8 mb-3 pb-2 border-b border-slate-200">
            <span className="text-slate-400 font-normal mr-1">Chapter 9.</span> OpenVMS Conditions
          </h2>

          <h3 id="cond-values" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            <span className="text-slate-400 font-normal mr-1">9.1</span> Condition Values
          </h3>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            OpenVMS condition values are 32-bit longword values that encode information about
            the facility that generated the condition, the specific condition, and its severity.
          </p>
          <DocTable
            headers={["Bits", "Field", "Description"]}
            rows={[
              ["31:28", "Control", "Control flags"],
              ["27:16", "Facility", "Facility number identifying the subsystem"],
              ["15:3", "Message", "Message number within the facility"],
              ["2:0", "Severity", "Severity level"],
            ]}
          />
          <DocTable
            headers={["Code", "Value", "Meaning"]}
            rows={[
              ["0", "Warning", "Operation completed with qualification"],
              ["1", "Success", "Operation completed successfully"],
              ["2", "Error", "Operation not completed"],
              ["3", "Information", "Informational message only"],
              ["4", "Fatal", "Severe error, operation not recoverable"],
            ]}
          />

          <h3 id="cond-handlers" className="text-[17px] font-semibold text-slate-800 mt-6 mb-2">
            <span className="text-slate-400 font-normal mr-1">9.2</span> Condition Handlers
          </h3>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            A <strong>condition handler</strong> is a procedure that is invoked when an
            exception or software-signaled condition occurs. Each call frame may optionally
            designate a condition handler.
          </p>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            A condition handler receives two arguments:
          </p>
          <ol className="list-decimal pl-7 mb-4 text-[15px] text-slate-700 space-y-1">
            <li><strong>Signal array</strong> — contains the condition value and signal-specific parameters</li>
            <li><strong>Mechanism array</strong> — contains information about the state of the process</li>
          </ol>
          <p className="mb-3 leading-relaxed text-[15px] text-slate-700">
            The handler can take one of the following actions:
          </p>
          <ul className="list-disc pl-7 mb-4 text-[15px] text-slate-700 space-y-1">
            <li><strong>Continue</strong> — correct the error and resume execution at the point of the signal</li>
            <li><strong>Resignal</strong> — decline to handle the condition; the system continues searching</li>
            <li><strong>Unwind</strong> — terminate one or more procedure activations and transfer control</li>
          </ul>

          {/* Footer */}
          <hr className="my-7 border-slate-200" />
          <div className="flex justify-between text-[13px] text-slate-400 pt-2">
            <span>&copy; 2024 VMS Software, Inc. All rights reserved.</span>
            <div className="flex gap-3">
              <span className="hover:text-blue-600 cursor-pointer">Resources</span>
              <span className="hover:text-blue-600 cursor-pointer">What We Offer</span>
              <span className="hover:text-blue-600 cursor-pointer">Contact Us</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
