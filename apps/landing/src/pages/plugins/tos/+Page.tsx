import { Button } from "@bitcart/ui-kit/components"
import { Link } from "@bitcart/vike-kit/navigation"

export default function Page() {
  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl px-6 py-16 sm:px-8 lg:px-12 mx-auto">
        <div className="prose prose-gray dark:prose-invert text-muted-foreground max-w-none">
          <h1 className="text-3xl font-bold mb-8 pt-8 text-center">
            BITCART PAID PLUGINS TERMS OF SERVICE
          </h1>

          <p className="text-muted-foreground mb-8 text-center">Last updated: 2025-03-05</p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">1. Introduction</h2>

          <p className="leading-relaxed mb-6">
            Welcome to <strong>Bitcart</strong> (&quot;Company&quot;, &quot;we&quot;,
            &quot;our&quot;, &quot;us&quot;)!
          </p>

          <p className="leading-relaxed mb-6">
            These Terms of Service (&quot;Terms&quot;, &quot;Terms of Service&quot;) govern your use
            of our paid plugins available through the license server at{" "}
            <strong>licensing.bitcart.ai</strong> and accessible via the plugins page of your
            Bitcart instance (together or individually &quot;Service&quot;) operated by{" "}
            <strong>Bitcart</strong>.
          </p>

          <p className="leading-relaxed mb-6">
            These Terms specifically apply to the paid plugins and extensions available for purchase
            and use with your Bitcart instance. The plugins are distributed through our license
            server at licensing.bitcart.ai and can be installed and managed through your Bitcart
            instance&apos;s plugins page.
          </p>

          <p className="leading-relaxed mb-12">
            IMPORTANT: Bitcart plugins operate on your own self-hosted Bitcart instance. You
            maintain full control and responsibility for all cryptocurrency assets and funds
            processed through your instance. We do not have access to, control over, or
            responsibility for any cryptocurrency or other assets managed by your Bitcart instance
            or any plugins installed on it.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">2. Communications</h2>

          <p className="leading-relaxed mb-12">
            By using our Service, you agree to subscribe to newsletters, marketing or promotional
            materials and other information we may send. However, you may opt out of receiving any,
            or all, of these communications from us by following the unsubscribe link or by emailing
            at{" "}
            <Button
              render={<Link href="mailto:support@bitcart.ai" />}
              nativeButton={false}
              variant="link"
              size="inline"
            >
              support@bitcart.ai
            </Button>
            .
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">3. Purchases</h2>

          <p className="leading-relaxed mb-6">
            If you wish to purchase any paid plugin made available through Service
            (&quot;Purchase&quot;), you may be asked to supply certain information relevant to your
            Purchase including but not limited to, your credit or debit card number, the expiration
            date of your card, your billing address, and other payment information.
          </p>

          <p className="leading-relaxed mb-6">
            You represent and warrant that: (i) you have the legal right to use any card(s) or other
            payment method(s) in connection with any Purchase; and that (ii) the information you
            supply to us is true, correct and complete.
          </p>

          <p className="leading-relaxed mb-6">
            We may employ the use of third party services for the purpose of facilitating payment
            and the completion of Purchases. By submitting your information, you grant us the right
            to provide the information to these third parties subject to our Privacy Policy.
          </p>

          <p className="leading-relaxed mb-6">
            We reserve the right to refuse or cancel your order at any time for reasons including
            but not limited to: product or service availability, errors in the description or price
            of the product or service, error in your order or other reasons.
          </p>

          <p className="leading-relaxed mb-12">
            We reserve the right to refuse or cancel your order if fraud or an unauthorized or
            illegal transaction is suspected.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">
            4. Contests, Sweepstakes and Promotions
          </h2>

          <p className="leading-relaxed mb-12">
            Any contests, sweepstakes or other promotions (collectively, &quot;Promotions&quot;)
            made available through Service may be governed by rules that are separate from these
            Terms of Service. If you participate in any Promotions, please review the applicable
            rules as well as our Privacy Policy. If the rules for a Promotion conflict with these
            Terms of Service, Promotion rules will apply.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">5. Refunds</h2>

          <p className="leading-relaxed mb-12">
            We issue refunds for Paid Plugin purchases within <strong>30 days</strong> of the
            original purchase date. Refund requests must be submitted to{" "}
            <Button
              render={<Link href="mailto:support@bitcart.ai" />}
              nativeButton={false}
              variant="link"
              size="inline"
            >
              support@bitcart.ai
            </Button>{" "}
            with your purchase details and reason for the refund request.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">6. Content</h2>

          <p className="leading-relaxed mb-6">
            Our Service allows you to post, link, store, share and otherwise make available certain
            information, text, graphics, videos, or other material (&quot;Content&quot;). You are
            responsible for Content that you post on or through Service, including its legality,
            reliability, and appropriateness.
          </p>

          <p className="leading-relaxed mb-6">
            By posting Content on or through Service, You represent and warrant that: (i) Content is
            yours (you own it) and/or you have the right to use it and the right to grant us the
            rights and license as provided in these Terms, and (ii) that the posting of your Content
            on or through Service does not violate the privacy rights, publicity rights, copyrights,
            contract rights or any other rights of any person or entity. We reserve the right to
            terminate the account of anyone found to be infringing on a copyright.
          </p>

          <p className="leading-relaxed mb-6">
            You retain any and all of your rights to any Content you submit, post or display on or
            through Service and you are responsible for protecting those rights. We take no
            responsibility and assume no liability for Content you or any third party posts on or
            through Service. However, by posting Content using Service you grant us the right and
            license to use, modify, publicly perform, publicly display, reproduce, and distribute
            such Content on and through Service. You agree that this license includes the right for
            us to make your Content available to other users of Service, who may also use your
            Content subject to these Terms.
          </p>

          <p className="leading-relaxed mb-6">
            Bitcart has the right but not the obligation to monitor and edit all Content provided by
            users.
          </p>

          <p className="leading-relaxed mb-12">
            In addition, Content found on or through this Service are the property of Bitcart or
            used with permission. You may not distribute, modify, transmit, reuse, download, repost,
            copy, or use said Content, whether in whole or in part, for commercial purposes or for
            personal gain, without express advance written permission from us.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">7. Prohibited Uses</h2>

          <p className="leading-relaxed mb-6">
            You may use Service only for lawful purposes and in accordance with Terms. You agree not
            to use Service:
          </p>

          <p className="leading-relaxed mb-4">
            0.1. In any way that violates any applicable national or international law or
            regulation.
          </p>

          <p className="leading-relaxed mb-4">
            0.2. For the purpose of exploiting, harming, or attempting to exploit or harm minors in
            any way by exposing them to inappropriate content or otherwise.
          </p>

          <p className="leading-relaxed mb-4">
            0.3. To transmit, or procure the sending of, any advertising or promotional material,
            including any &quot;junk mail&quot;, &quot;chain letter,&quot; &quot;spam,&quot; or any
            other similar solicitation.
          </p>

          <p className="leading-relaxed mb-4">
            0.4. To impersonate or attempt to impersonate Company, a Company employee, another user,
            or any other person or entity.
          </p>

          <p className="leading-relaxed mb-4">
            0.5. In any way that infringes upon the rights of others, or in any way is illegal,
            threatening, fraudulent, or harmful, or in connection with any unlawful, illegal,
            fraudulent, or harmful purpose or activity.
          </p>

          <p className="leading-relaxed mb-6">
            0.6. To engage in any other conduct that restricts or inhibits anyone&apos;s use or
            enjoyment of Service, or which, as determined by us, may harm or offend Company or users
            of Service or expose them to liability.
          </p>

          <p className="leading-relaxed mb-4">Additionally, you agree not to:</p>

          <p className="leading-relaxed mb-4">
            0.1. Use Service in any manner that could disable, overburden, damage, or impair Service
            or interfere with any other party&apos;s use of Service, including their ability to
            engage in real time activities through Service.
          </p>

          <p className="leading-relaxed mb-4">
            0.2. Use any robot, spider, or other automatic device, process, or means to access
            Service for any purpose, including monitoring or copying any of the material on Service.
          </p>

          <p className="leading-relaxed mb-4">
            0.3. Use any manual process to monitor or copy any of the material on Service or for any
            other unauthorized purpose without our prior written consent.
          </p>

          <p className="leading-relaxed mb-4">
            0.4. Use any device, software, or routine that interferes with the proper working of
            Service.
          </p>

          <p className="leading-relaxed mb-4">
            0.5. Introduce any viruses, trojan horses, worms, logic bombs, or other material which
            is malicious or technologically harmful.
          </p>

          <p className="leading-relaxed mb-4">
            0.6. Attempt to gain unauthorized access to, interfere with, damage, or disrupt any
            parts of Service, the server on which Service is stored, or any server, computer, or
            database connected to Service.
          </p>

          <p className="leading-relaxed mb-4">
            0.7. Attack Service via a denial-of-service attack or a distributed denial-of-service
            attack.
          </p>

          <p className="leading-relaxed mb-4">
            0.8. Take any action that may damage or falsify Company rating.
          </p>

          <p className="leading-relaxed mb-12">
            0.9. Otherwise attempt to interfere with the proper working of Service.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">8. Analytics</h2>

          <p className="leading-relaxed mb-12">
            We may use third-party Service Providers to monitor and analyze the use of our Service.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">9. No Use By Minors</h2>

          <p className="leading-relaxed mb-12">
            Service is intended only for access and use by individuals at least eighteen (18) years
            old. By accessing or using Service, you warrant and represent that you are at least
            eighteen (18) years of age and with the full authority, right, and capacity to enter
            into this agreement and abide by all of the terms and conditions of Terms. If you are
            not at least eighteen (18) years old, you are prohibited from both the access and usage
            of Service.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">10. Intellectual Property</h2>

          <p className="leading-relaxed mb-12">
            Service and its original content (excluding Content provided by users), features and
            functionality are and will remain the exclusive property of Bitcart and its licensors.
            Service is protected by copyright, trademark, and other laws of and foreign countries.
            Our trademarks may not be used in connection with any product or service without the
            prior written consent of Bitcart.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">11. Copyright Policy</h2>

          <p className="leading-relaxed mb-6">
            We respect the intellectual property rights of others. It is our policy to respond to
            any claim that Content posted on Service infringes on the copyright or other
            intellectual property rights (&quot;Infringement&quot;) of any person or entity.
          </p>

          <p className="leading-relaxed mb-6">
            If you are a copyright owner, or authorized on behalf of one, and you believe that the
            copyrighted work has been copied in a way that constitutes copyright infringement,
            please submit your claim via email to{" "}
            <Button
              render={<Link href="mailto:support@bitcart.ai" />}
              nativeButton={false}
              variant="link"
              size="inline"
            >
              support@bitcart.ai
            </Button>
            , with the subject line: &quot;Copyright Infringement&quot; and include in your claim a
            detailed description of the alleged Infringement as detailed below, under &quot;DMCA
            Notice and Procedure for Copyright Infringement Claims&quot;
          </p>

          <p className="leading-relaxed mb-12">
            You may be held accountable for damages (including costs and attorneys&apos; fees) for
            misrepresentation or bad-faith claims on the infringement of any Content found on and/or
            through Service on your copyright.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">
            12. DMCA Notice and Procedure for Copyright Infringement Claims
          </h2>

          <p className="leading-relaxed mb-6">
            You may submit a notification pursuant to the Digital Millennium Copyright Act (DMCA) by
            providing our Copyright Agent with the following information in writing (see 17 U.S.C
            512(c)(3) for further detail):
          </p>

          <p className="leading-relaxed mb-4">
            0.1. an electronic or physical signature of the person authorized to act on behalf of
            the owner of the copyright&apos;s interest;
          </p>

          <p className="leading-relaxed mb-4">
            0.2. a description of the copyrighted work that you claim has been infringed, including
            the URL (i.e., web page address) of the location where the copyrighted work exists or a
            copy of the copyrighted work;
          </p>

          <p className="leading-relaxed mb-4">
            0.3. identification of the URL or other specific location on Service where the material
            that you claim is infringing is located;
          </p>

          <p className="leading-relaxed mb-4">
            0.4. your address, telephone number, and email address;
          </p>

          <p className="leading-relaxed mb-4">
            0.5. a statement by you that you have a good faith belief that the disputed use is not
            authorized by the copyright owner, its agent, or the law;
          </p>

          <p className="leading-relaxed mb-6">
            0.6. a statement by you, made under penalty of perjury, that the above information in
            your notice is accurate and that you are the copyright owner or authorized to act on the
            copyright owner&apos;s behalf.
          </p>

          <p className="leading-relaxed mb-12">
            You can contact our Copyright Agent via email at{" "}
            <Button
              render={<Link href="mailto:support@bitcart.ai" />}
              nativeButton={false}
              variant="link"
              size="inline"
            >
              support@bitcart.ai
            </Button>
            .
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">13. Error Reporting and Feedback</h2>

          <p className="leading-relaxed mb-6">
            You may provide us either directly at{" "}
            <Button
              render={<Link href="mailto:support@bitcart.ai" />}
              nativeButton={false}
              variant="link"
              size="inline"
            >
              support@bitcart.ai
            </Button>{" "}
            or via third party sites and tools with information and feedback concerning errors,
            suggestions for improvements, ideas, problems, complaints, and other matters related to
            our Service (&quot;Feedback&quot;). You acknowledge and agree that: (i) you shall not
            retain, acquire or assert any intellectual property right or other right, title or
            interest in or to the Feedback; (ii) Company may have development ideas similar to the
            Feedback; (iii) Feedback does not contain confidential information or proprietary
            information from you or any third party; and (iv) Company is not under any obligation of
            confidentiality with respect to the Feedback. In the event the transfer of the ownership
            to the Feedback is not possible due to applicable mandatory laws, you grant Company and
            its affiliates an exclusive, transferable, irrevocable, free-of-charge, sub-licensable,
            unlimited and perpetual right to use (including copy, modify, create derivative works,
            publish, distribute and commercialize) Feedback in any manner and for any purpose.
          </p>
          <h2 className="text-2xl font-semibold mt-12 mb-6">14. Links To Other Web Sites</h2>
          <p className="leading-relaxed mb-6">
            Our Service may contain links to third party web sites or services that are not owned or
            controlled by Bitcart.
          </p>
          <p className="leading-relaxed mb-6">
            Bitcart has no control over, and assumes no responsibility for the content, privacy
            policies, or practices of any third party web sites or services. We do not warrant the
            offerings of any of these entities/individuals or their websites.
          </p>
          <p className="leading-relaxed mb-6">
            YOU ACKNOWLEDGE AND AGREE THAT COMPANY SHALL NOT BE RESPONSIBLE OR LIABLE, DIRECTLY OR
            INDIRECTLY, FOR ANY DAMAGE OR LOSS CAUSED OR ALLEGED TO BE CAUSED BY OR IN CONNECTION
            WITH USE OF OR RELIANCE ON ANY SUCH CONTENT, GOODS OR SERVICES AVAILABLE ON OR THROUGH
            ANY SUCH THIRD PARTY WEB SITES OR SERVICES.
          </p>
          <p className="leading-relaxed mb-6">
            WE STRONGLY ADVISE YOU TO READ THE TERMS OF SERVICE AND PRIVACY POLICIES OF ANY THIRD
            PARTY WEB SITES OR SERVICES THAT YOU VISIT.
          </p>
          <h2 className="text-2xl font-semibold mt-12 mb-6">
            15. Disclaimer Of Warranty and Cryptocurrency Assets
          </h2>
          <p className="leading-relaxed mb-6">
            THESE SERVICES ARE PROVIDED BY COMPANY ON AN &quot;AS IS&quot; AND &quot;AS
            AVAILABLE&quot; BASIS. COMPANY MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND,
            EXPRESS OR IMPLIED, AS TO THE OPERATION OF THEIR SERVICES, OR THE INFORMATION, CONTENT
            OR MATERIALS INCLUDED THEREIN. YOU EXPRESSLY AGREE THAT YOUR USE OF THESE SERVICES,
            THEIR CONTENT, AND ANY SERVICES OR ITEMS OBTAINED FROM US IS AT YOUR SOLE RISK.
          </p>
          <p className="leading-relaxed mb-6">
            CRYPTOCURRENCY DISCLAIMER: YOU EXPRESSLY UNDERSTAND AND AGREE THAT BITCART AND ITS PAID
            PLUGINS OPERATE ON YOUR SELF-HOSTED INSTANCE. WE HAVE NO ACCESS TO OR CONTROL OVER ANY
            CRYPTOCURRENCY, FUNDS, OR OTHER ASSETS PROCESSED THROUGH YOUR INSTANCE. YOU ARE SOLELY
            RESPONSIBLE FOR THE SECURITY, BACKUP, AND MANAGEMENT OF ALL PRIVATE KEYS, FUNDS, AND
            ASSETS. IN NO EVENT SHALL WE BE LIABLE FOR ANY LOSS OF CRYPTOCURRENCY OR OTHER ASSETS,
            WHETHER DUE TO PLUGIN FUNCTIONALITY, SECURITY ISSUES, OR ANY OTHER CAUSE.
          </p>
          <p className="leading-relaxed mb-6">
            NEITHER COMPANY NOR ANY PERSON ASSOCIATED WITH COMPANY MAKES ANY WARRANTY OR
            REPRESENTATION WITH RESPECT TO THE COMPLETENESS, SECURITY, RELIABILITY, QUALITY,
            ACCURACY, OR AVAILABILITY OF THE SERVICES. WITHOUT LIMITING THE FOREGOING, NEITHER
            COMPANY NOR ANYONE ASSOCIATED WITH COMPANY REPRESENTS OR WARRANTS THAT THE SERVICES,
            THEIR CONTENT, OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE SERVICES WILL BE ACCURATE,
            RELIABLE, ERROR-FREE, OR UNINTERRUPTED, THAT DEFECTS WILL BE CORRECTED, THAT THE
            SERVICES OR THE SERVER THAT MAKES IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL
            COMPONENTS OR THAT THE SERVICES OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE SERVICES
            WILL OTHERWISE MEET YOUR NEEDS OR EXPECTATIONS.
          </p>
          <p className="leading-relaxed mb-6">
            COMPANY HEREBY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED,
            STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY,
            NON-INFRINGEMENT, AND FITNESS FOR PARTICULAR PURPOSE.
          </p>
          <p className="leading-relaxed mb-6">
            THE FOREGOING DOES NOT AFFECT ANY WARRANTIES WHICH CANNOT BE EXCLUDED OR LIMITED UNDER
            APPLICABLE LAW.
          </p>
          <h2 className="text-2xl font-semibold mt-12 mb-6">16. Limitation Of Liability</h2>
          <p className="leading-relaxed mb-6">
            EXCEPT AS PROHIBITED BY LAW, YOU WILL HOLD US AND OUR OFFICERS, DIRECTORS, EMPLOYEES,
            AND AGENTS HARMLESS FOR ANY INDIRECT, PUNITIVE, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL
            DAMAGE, HOWEVER IT ARISES (INCLUDING ATTORNEYS&apos; FEES AND ALL RELATED COSTS AND
            EXPENSES OF LITIGATION AND ARBITRATION, OR AT TRIAL OR ON APPEAL, IF ANY, WHETHER OR NOT
            LITIGATION OR ARBITRATION IS INSTITUTED), WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE,
            OR OTHER TORTIOUS ACTION, OR ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT,
            INCLUDING WITHOUT LIMITATION ANY CLAIM FOR PERSONAL INJURY OR PROPERTY DAMAGE, ARISING
            FROM THIS AGREEMENT AND ANY VIOLATION BY YOU OF ANY FEDERAL, STATE, OR LOCAL LAWS,
            STATUTES, RULES, OR REGULATIONS, EVEN IF COMPANY HAS BEEN PREVIOUSLY ADVISED OF THE
            POSSIBILITY OF SUCH DAMAGE. EXCEPT AS PROHIBITED BY LAW, IF THERE IS LIABILITY FOUND ON
            THE PART OF COMPANY, IT WILL BE LIMITED TO THE AMOUNT PAID FOR THE PRODUCTS AND/OR
            SERVICES, AND UNDER NO CIRCUMSTANCES WILL THERE BE CONSEQUENTIAL OR PUNITIVE DAMAGES.
            SOME STATES DO NOT ALLOW THE EXCLUSION OR LIMITATION OF PUNITIVE, INCIDENTAL OR
            CONSEQUENTIAL DAMAGES, SO THE PRIOR LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU.
          </p>
          <h2 className="text-2xl font-semibold mt-12 mb-6">17. Termination</h2>
          <p className="leading-relaxed mb-6">
            We may terminate or suspend your account and bar access to Service immediately, without
            prior notice or liability, under our sole discretion, for any reason whatsoever and
            without limitation, including but not limited to a breach of Terms.
          </p>
          <p className="leading-relaxed mb-6">
            If you wish to terminate your account, you may simply discontinue using Service.
          </p>
          <p className="leading-relaxed mb-6">
            All provisions of Terms which by their nature should survive termination shall survive
            termination, including, without limitation, ownership provisions, warranty disclaimers,
            indemnity and limitations of liability.
          </p>
          <h2 className="text-2xl font-semibold mt-12 mb-6">18. Governing Law</h2>
          <p className="leading-relaxed mb-6">
            These Terms shall be governed and construed in accordance with applicable laws, without
            regard to principles of conflict of laws.
          </p>
          <p className="leading-relaxed mb-6">
            Our failure to enforce any right or provision of these Terms will not be considered a
            waiver of those rights. If any provision of these Terms is held to be invalid or
            unenforceable by a court, the remaining provisions of these Terms will remain in effect.
            These Terms constitute the entire agreement between us regarding our Service and
            supersede and replace any prior agreements we might have had between us regarding
            Service.
          </p>
          <h2 className="text-2xl font-semibold mt-12 mb-6">19. Changes To Service</h2>
          <p className="leading-relaxed mb-6">
            We reserve the right to withdraw or amend our Service, and any service or material we
            provide via Service, in our sole discretion without notice. We will not be liable if for
            any reason all or any part of Service is unavailable at any time or for any period. From
            time to time, we may restrict access to some parts of Service, or the entire Service, to
            users, including registered users.
          </p>
          <h2 className="text-2xl font-semibold mt-12 mb-6">20. Amendments To Terms</h2>
          <p className="leading-relaxed mb-6">
            We may amend Terms at any time by posting the amended terms on this site. It is your
            responsibility to review these Terms periodically.
          </p>
          <p className="leading-relaxed mb-6">
            Your continued use of the Platform following the posting of revised Terms means that you
            accept and agree to the changes. You are expected to check this page frequently so you
            are aware of any changes, as they are binding on you.
          </p>
          <p className="leading-relaxed mb-6">
            By continuing to access or use our Service after any revisions become effective, you
            agree to be bound by the revised terms. If you do not agree to the new terms, you are no
            longer authorized to use Service.
          </p>
          <h2 className="text-2xl font-semibold mt-12 mb-6">21. Waiver And Severability</h2>
          <p className="leading-relaxed mb-6">
            No waiver by Company of any term or condition set forth in Terms shall be deemed a
            further or continuing waiver of such term or condition or a waiver of any other term or
            condition, and any failure of Company to assert a right or provision under Terms shall
            not constitute a waiver of such right or provision.
          </p>
          <p className="leading-relaxed mb-6">
            If any provision of Terms is held by a court or other tribunal of competent jurisdiction
            to be invalid, illegal or unenforceable for any reason, such provision shall be
            eliminated or limited to the minimum extent such that the remaining provisions of Terms
            will continue in full force and effect.
          </p>
          <h2 className="text-2xl font-semibold mt-12 mb-6">22. Acknowledgement</h2>
          <p className="leading-relaxed mb-6">
            BY USING SERVICE OR OTHER SERVICES PROVIDED BY US, YOU ACKNOWLEDGE THAT YOU HAVE READ
            THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
          </p>
          <h2 className="text-2xl font-semibold mt-12 mb-6">23. Contact Us</h2>
          <p className="leading-relaxed mb-6">
            Please send your feedback, comments, requests for technical support by email:{" "}
            <Button
              render={<Link href="mailto:support@bitcart.ai" />}
              nativeButton={false}
              variant="link"
              size="inline"
            >
              support@bitcart.ai
            </Button>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
